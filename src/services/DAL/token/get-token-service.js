/**
 * Retrieves a bearer token from Azure AD (App Registration).
 *
 * This function performs a POST request to the Azure AD token endpoint using the
 * client credentials. It sends the `client_id` and `client_secret`
 * stored in the app's configuration. The response includes a bearer token
 * (`access_token`) and the number of seconds until it expires (`expires_in`).
 *
 * The token is typically valid for two hours, and the `expiresAt` timestamp is calculated
 * to assist with token caching and renewal logic.
 *
 * This token is used to authenticate requests to the DAL API.
 *
 * @module getTokenService
 */

import Wreck from '@hapi/wreck'
import { DAL_TOKEN, TOKEN_EXPIRY_BUFFER_MS } from '../../../constants/cache-keys.js'
import { retry } from './retry-service.js'
import { config } from '../../../config/index.js'
import { get, set } from '../../../utils/caching/index.js'

const getTokenService = async (cache) => {
  return retry(() => getToken(cache))
}

/**
 * Attempts to get a token from cache first.
 * If no cached token exists, requests a new one from Azure AD.
 */
const getToken = async (cache) => {
  const cachedToken = await get(DAL_TOKEN, cache)

  if (cachedToken) {
    return cachedToken
  }

  // No cached token, fetch a new one
  const token = await getNewToken()

  // Cache the token slightly less than the actual expiry to avoid using an expired token
  // Here, 60 seconds is subtracted—adjust if your expires_in is in seconds
  await set(DAL_TOKEN, token.token, (token.expiresAt * 1000) - TOKEN_EXPIRY_BUFFER_MS, cache)

  return token.token
}

/**
 * Performs the actual POST request to the Azure AD token endpoint.
 * Constructs a URL-encoded form payload as required by OAuth 2.0 client credentials flow.
 *
 * Azure AD is the Authorization Server. The DAL is the protected resource we
 * access using this token.
 */
const getNewToken = async () => {
  const { clientId, clientSecret, tokenEndpoint } = config.get('dalConfig')

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: `${clientId}/.default`
  })

  const { payload } = await Wreck.post(tokenEndpoint, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload: form.toString(),
    json: true
  })

  // Combine token type and access token to create the full Authorization header value
  // e.g., "Bearer abc123xyz"
  // Return token and its expiry time (in ms) for caching
  return {
    token: `${payload.token_type} ${payload.access_token}`,
    expiresAt: payload.expires_in
  }
}

export {
  getTokenService
}
