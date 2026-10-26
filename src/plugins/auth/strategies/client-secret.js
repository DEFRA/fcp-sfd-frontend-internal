/**
 * Registers the authentication strategies for the Hapi server
 *
 * This file sets up two authentication methods:
 * 1. Entra (Azure AD) OAuth 2.0 - logs users in via the corporate identity provider
 * 2. Session cookie - keeps users logged in across requests
 *
 * When a user visits the app, they're redirected to Entra to sign in. After login,
 * their credentials are stored in a session cookie and a server-side cache. On each request,
 * we validate their JWT token and refresh it if needed to keep them logged in.
 *
 * This is the glue between user identity and the rest of the app.
 *
 * @module clientSecret
 */

import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../../../auth/get-oidc-config.js'
import { refreshTokens } from '../../../auth/refresh-tokens.js'
import { getSafeRedirect } from '../../../utils/get-safe-redirect.js'
import { getCookieOptions } from '../get-cookie-options.js'
import { config } from '../../../config/index.js'

/**
 * Registers the authentication strategies for the Hapi server
 *
 * Registers the Entra (Bell) strategy and the session cookie strategy, and sets the session strategy as the default.
 *
 * @param {object} server - The Hapi server
 *
 * @returns {Promise<void>}
 */
async function registerClientSecretStrategy (server) {
  const oidcConfig = await getOidcConfig()

  // Bell is a third-party plugin that provides a common interface for OAuth 2.0 authentication
  // Used to authenticate users with Entra and a pre-requisite for the Cookie authentication strategy
  // Also used for changing organisations and signing out
  server.auth.strategy('entra', 'bell', getBellOptions(oidcConfig))

  // Cookie is a built-in authentication strategy for hapi.js that authenticates users based on a session cookie
  // Used for all non-Entra routes
  // Lax policy required to allow redirection after Entra sign out
  server.auth.strategy('session', 'cookie', getCookieOptions(validateToken))

  // Set the default authentication strategy to session
  // All routes will require authentication unless explicitly set to 'entra' or `auth: false`
  server.auth.default('session')
}

/**
 * Builds the Bell options used to authenticate users with Entra
 *
 * @param {object} oidcConfig - The Entra OpenID Connect configuration
 *
 * @returns {object} The Bell strategy options
 */
function getBellOptions (oidcConfig) {
  const sessionCookieSecure = config.get('server.session.cookie.secure')

  return {
    provider: {
      name: 'entra',
      protocol: 'oauth2',
      useParamsAuth: true,
      auth: oidcConfig.authorization_endpoint,
      token: oidcConfig.token_endpoint,
      scope: [`${config.get('entra.clientId')}/.default`, 'offline_access'],
      profile: (credentials, _params, _get) => getProfile(credentials, _params, _get)
    },
    clientId: config.get('entra.clientId'),
    clientSecret: config.get('entra.clientSecret'),
    password: config.get('server.session.cookie.password'),
    isSecure: sessionCookieSecure,
    forceHttps: sessionCookieSecure,
    location: function (request) {
      if (request.query.redirect) {
        const safeRedirect = getSafeRedirect(request.query.redirect)
        request.yar.set('redirect', safeRedirect)
      }

      return config.get('entra.redirectUrl')
    },
    providerParams: function (_request) {
      return {
        response_mode: 'query'
      }
    }
  }
}

// The DAL identifies the acting caseworker from the `email` header, but Entra only puts an `email` claim in an
// access token when it has been configured as an optional claim on the app registration. Fall back to the other
// standard claims that carry the user's UPN so the header is populated whichever tenant issued the token.
const EMAIL_CLAIMS = ['email', 'upn', 'preferred_username', 'unique_name']

/**
 * Finds the name of the first claim in the token payload that holds a non-empty email address
 *
 * @param {object} payload - The decoded token payload
 *
 * @returns {string|undefined} The claim name, or undefined if none is found
 */
function getEmailClaim (payload) {
  return EMAIL_CLAIMS.find((name) => typeof payload[name] === 'string' && payload[name].trim() !== '')
}

function getProfile (credentials, _params, _get) {
  const payload = Jwt.token.decode(credentials.token).decoded.payload
  const emailClaim = getEmailClaim(payload)

  // Map all JWT properties to the credentials object so it can be stored in the session
  // Add some additional properties to the profile object for convenience

  credentials.profile = {
    ...payload,
    email: payload[emailClaim]?.trim(),
    emailClaim,
    sessionId: payload.sid,
    loginHint: payload.login_hint
  }
}

/**
 * Validates the session and refreshes the Entra token when it has expired
 *
 * Returns an invalid result if there is no cached session, or if the token has expired and refreshing is disabled.
 *
 * @param {object} request - The Hapi request object
 * @param {object} session - The session cookie data
 * @param {string} session.sessionId - The ID used to look up the cached user session
 *
 * @returns {Promise<{isValid: boolean, credentials?: object}>} The validation result
 */
async function validateToken (request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  // If session does not exist, return an invalid session
  if (!userSession) {
    return { isValid: false }
  }

  // Verify Entra token has not expired
  try {
    const decoded = Jwt.token.decode(userSession.token)
    Jwt.token.verifyTime(decoded)
  } catch (err) {
    if (!config.get('entra.refreshTokens')) {
      request.server?.logger?.info(err.message)
      return { isValid: false }
    }
    const { access_token: token, refresh_token: refreshToken } = await refreshTokens(userSession.refreshToken)
    userSession.token = token
    userSession.refreshToken = refreshToken
    await request.server.app.cache.set(session.sessionId, userSession)
  }

  // Set the user's details on the request object and allow the request to continue
  // Depending on the service, additional checks can be performed here before returning `isValid: true`
  return { isValid: true, credentials: userSession }
}

export { registerClientSecretStrategy, getBellOptions, getEmailClaim, validateToken }
