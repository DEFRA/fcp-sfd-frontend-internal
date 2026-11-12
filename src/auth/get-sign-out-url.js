/**
 * Builds the Entra sign out URL
 *
 * @module getSignOutUrl
 */

import { getOidcConfig } from './get-oidc-config.js'
import { createState } from './state.js'
import { config } from '../config/index.js'

/**
 * Includes a random state value, stored in the session, so we can check that the user returns from the
 * same sign out request. This protects against CSRF (a forged request from another site).
 *
 * @param {object} request - The Hapi request object
 * @param {string} loginHint - The hint identifying the user to sign out
 *
 * @returns {Promise<string>} The encoded sign out URL
 */
async function getSignOutUrl (request, loginHint) {
  const { end_session_endpoint: url } = await getOidcConfig()

  // To prevent CSRF attacks, the state parameter should be passed during redirection
  // It should be verified when the user is redirected back to the application
  // The `createState` function generates a unique state value and stores it in the session
  const state = createState(request)

  const query = [
    `post_logout_redirect_uri=${config.get('entra.signOutRedirectUrl')}`,
    `logout_hint=${loginHint}`,
    `state=${state}`
  ].join('&')
  return encodeURI(`${url}?${query}`)
}

export { getSignOutUrl }
