import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../auth/get-oidc-config.js'
import { refreshTokens } from '../auth/refresh-tokens.js'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'
import { config } from '../config/index.js'

export const auth = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const oidcConfig = await getOidcConfig()

      // Bell is a third-party plugin that provides a common interface for OAuth 2.0 authentication
      // Used to authenticate users with Entra and a pre-requisite for the Cookie authentication strategy
      // Also used for changing organisations and signing out
      server.auth.strategy('entra', 'bell', getBellOptions(oidcConfig))

      // Cookie is a built-in authentication strategy for hapi.js that authenticates users based on a session cookie
      // Used for all non-Entra routes
      // Lax policy required to allow redirection after Entra sign out
      server.auth.strategy('session', 'cookie', getCookieOptions())

      // Set the default authentication strategy to session
      // All routes will require authentication unless explicitly set to 'entra' or `auth: false`
      server.auth.default('session')
    }
  }
}

function getBellOptions (oidcConfig) {
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
    isSecure: config.get('server.isProduction'),
    location: function (request) {
      // If request includes a redirect query parameter, store it in the session to allow redirection after authentication
      if (request.query.redirect) {
        // Ensure redirect is a relative path to prevent redirect attacks
        const safeRedirect = getSafeRedirect(request.query.redirect)
        request.yar.set('redirect', safeRedirect)
      }

      return config.get('entra.redirectUrl')
    },
    providerParams: function (request) {
      const params = {
        response_mode: 'query'
      }

      // TODO
      // If user intends to switch organisation, force Entra to display the organisation selection screen
      // if (request.path === '/auth/organisation') {
      //   params.forceReselection = true
      //   // If user has already selected an organisation in another service, pass the organisation Id to force Defra Id to skip the organisation selection screen
      //   if (request.query.organisationId) {
      //     params.relationshipId = request.query.organisationId
      //   }
      // }

      return params
    }
  }
}

function getCookieOptions () {
  return {
    cookie: {
      password: config.get('server.session.cookie.password'),
      path: '/',
      isSecure: config.get('server.isProduction'),
      isSameSite: 'Lax'
    },
    redirectTo: function (request) {
      return `/auth/sign-in?redirect=${request.url.pathname}${request.url.search}`
    },
    validate: async (request, session) => validateToken(request, session)
  }
}

function getProfile (credentials, _params, _get) {
  const payload = Jwt.token.decode(credentials.token).decoded.payload

  // Map all JWT properties to the credentials object so it can be stored in the session
  // Add some additional properties to the profile object for convenience
  credentials.profile = {
    ...payload,
    sessionId: payload.sid
  }
}

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

export { getBellOptions, getCookieOptions }
