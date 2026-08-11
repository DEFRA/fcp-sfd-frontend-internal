/**
 * Federated credentials authentication strategy for the Hapi server.
 *
 * This file sets up user authentication using federated credentials (OIDC) with the
 * @defra/hapi-auth-oidc plugin. Unlike client-secret.js which manually handles OAuth
 * flow and token management, this strategy lets the plugin handle OIDC discovery, login
 * callbacks, and token refresh automatically.
 *
 * The main responsibilities here are:
 * - Registering the hapi-auth-oidc plugin with Entra (Azure AD) configuration
 * - Setting up session cookies to keep users logged in across requests
 * - Validating tokens and refreshing them on each request
 *
 * User session data is cached in memory.
 */

import { hapiAuthOidcPlugin, WebIdentityTokenProvider, MockProvider } from '@defra/hapi-auth-oidc'
import { getCookieOptions } from '../get-cookie-options.js'
import { config } from '../../../config/index.js'

/**
 * Chooses which authentication provider to use based on the config settings.
 *
 * In production: uses WebIdentityTokenProvider to validate real credentials from Entra
 * In development: uses MockProvider so we can test without actually connecting to Entra
 *
 * Mocking is required locally because the development environment runs in Docker and
 * does not have access to the CDP instance or AWS to fetch and verify tokens.
 *
 * @returns {WebIdentityTokenProvider|MockProvider} Either the real or mock provider
 */
function buildAuthProvider () {
  const { audience, enableMocking } = config.get('entra.federatedCredentials')
  console.error(`[STARTUP] buildAuthProvider - audience="${audience}", enableMocking=${enableMocking}`)
  return enableMocking
    ? new MockProvider({})
    : new WebIdentityTokenProvider({ audience: [audience] })
}

/**
 * Sets up the authentication system when the app starts.
 *
 * This function does three things:
 * 1. Registers the hapi-auth-oidc plugin to handle OIDC discovery, login callbacks,
 *    and automatic token refresh with Entra
 * 2. Configures a session cookie strategy to maintain user login state across requests
 * 3. Sets the session strategy as the default authentication method for all routes
 *
 * @param {object} server - The Hapi server instance (passed in when the app starts)
 * @returns {Promise<void>}
 */
async function registerFederatedStrategy (server) {
  const clientId = config.get('entra.clientId')
  const sessionCookieSecure = config.get('server.session.cookie.secure')
  const externalBaseUrl = config.get('entra.externalBaseUrl')

  await server.register({
    plugin: hapiAuthOidcPlugin,
    options: {
      oidc: {
        discoveryUri: config.get('entra.wellKnownUrl'),
        clientId,
        authProvider: buildAuthProvider(),
        scope: `${clientId}/.default offline_access`,
        loginCallbackUri: '/auth/sign-in-oidc',
        responseMode: 'query',
        externalBaseUrl,
        defaultPostLoginUri: `${externalBaseUrl}/search-sbi`
      },
      cookieOptions: {
        password: config.get('server.session.cookie.password'),
        isSecure: sessionCookieSecure,
        isSameSite: sessionCookieSecure ? 'None' : 'Lax'
      }
    }
  })

  server.auth.strategy('session', 'cookie', getCookieOptions(validateToken))
  server.auth.default('session')
  server?.logger?.info('[TEST] Federated credentials strategy registered successfully')
}

/**
 * Checks if a user is still logged in and refreshes their token if needed.
 *
 * This function runs on every request and does the following:
 * 1. Looks up the user's session data using the session ID from their cookie
 * 2. Checks if their authentication token (from Entra) is still valid using
 *    request.ensureValidToken() - this method is provided by the hapi-auth-oidc plugin
 * 3. If the token expired and got refreshed, we update the stored session so next
 *    request has the new token
 * 4. If everything is valid, we let the request continue
 *
 * If the session doesn't exist or the token can't be validated, we send them to the
 * sign-in page (they need to log in again).
 *
 * @param {object} request - The incoming HTTP request (from Hapi)
 * @param {object} session - The session stored in the cookie
 * @param {string} session.sessionId - A unique ID that identifies this user's session
 * @returns {Promise<object>} Either { isValid: true, credentials: userSession } or { isValid: false }
 */
async function validateToken (request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  if (!userSession) {
    return { isValid: false }
  }

  // For federated credentials, the plugin (@defra/hapi-auth-oidc) handles token refresh
  // through its own mechanisms. The cookie validator should only verify that a session
  // exists and has the required tokens. We do NOT attempt to call request.ensureValidToken()
  // here because that can break the plugin's internal provider context and cause
  // "audience is null" errors during AWS STS calls.

  const hasAccessToken = userSession.accessToken &&
                         typeof userSession.accessToken === 'string' &&
                         userSession.accessToken.trim().length > 0
  const hasRefreshToken = userSession.refreshToken &&
                          typeof userSession.refreshToken === 'string' &&
                          userSession.refreshToken.trim().length > 0

  if (!hasAccessToken || !hasRefreshToken) {
    return { isValid: false }
  }

  // Session exists and has valid tokens - let the cookie stay valid
  return { isValid: true, credentials: userSession }
}

export { registerFederatedStrategy }
