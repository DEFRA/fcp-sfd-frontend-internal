import Jwt from '@hapi/jwt'
import { getSafeRedirect } from '../utils/get-safe-redirect.js'
import { config } from '../../config/config.js'

export default {
  plugin: {
    name: 'auth',
    register: async (server) => {

      // Bell is a third-party plugin that provides a common interface for OAuth 2.0 authentication
      // Used to authenticate users with Entra and a pre-requisite for the Cookie authentication strategy
      // Also used for changing organisations and signing out
      server.auth.strategy('entra', 'bell', getBellOptions())

      // Cookie is a built-in authentication strategy for hapi.js that authenticates users based on a session cookie
      // Used for all non-Entra routes
      // Lax policy required to allow redirection after Entra sign out
      server.auth.strategy('session', 'cookie', getCookieOptions())

      // Set the default authentication strategy to session
      // All routes will require authentication unless explicitly set to 'defra-id' or `auth: false`
      server.auth.default('session')
    }
  }
}

function getBellOptions () {
  return {
    provider: {
      name: 'entra',
      protocol: 'oauth2',
      useParamsAuth: true,
      auth: `https://login.microsoftonline.com/${config.get('entra.tenantId')}/oauth2/v2.0/authorize`,
      token: `https://login.microsoftonline.com/${config.get('entra.tenantId')}/oauth2/v2.0/token`,
      scope: ['openid', 'offline_access', config.get('entra.clientId')],
      profile: function (credentials, _params, _get) {
        const payload = Jwt.token.decode(credentials.token).decoded.payload

        // TODO: get from Entra
        // Map all JWT properties to the credentials object so it can be stored in the session
        // Add some additional properties to the profile object for convenience
        credentials.profile = {
          ...payload,
          // crn: payload.contactId,
          // name: `${payload.firstName} ${payload.lastName}`,
          // organisationId: payload.currentRelationshipId
        }
      }
    },
    clientId: config.get('entra.clientId'),
    clientSecret: config.get('entra.clientSecret'),
    password: config.get('session.cookie.password'),
    isSecure: config.get('isProduction'),
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
      // const params = {
      //   serviceId: config.get('defraId.serviceId'),
      //   p: config.get('defraId.policy'),
      //   response_mode: 'query'
      // }

      // return params
    }
  }
}

function getCookieOptions () {
  return {
    cookie: {
      password: config.get('session.cookie.password'),
      path: '/',
      isSecure: false,
      isSameSite: 'Lax'
    },
    redirectTo: function (request) {
      return `/auth/sign-in?redirect=${request.url.pathname}${request.url.search}`
    },
    validate: async function (request, session) {
      const userSession = await request.server.app.cache.get(session.sessionId)

      // If session does not exist, return an invalid session
      if (!userSession) {
        return { isValid: false }
      }

      // Verify Entra token has not expired
      try {
        const decoded = Jwt.token.decode(userSession.token)
        Jwt.token.verifyTime(decoded)
      } catch (error) {
        if (!config.get('entra.refreshTokens')) {
          return { isValid: false }
        }
        // TODO: refresh tokens., return false for now
        return { isValid: false }
        // const { access_token: token, refresh_token: refreshToken } = await refreshTokens(userSession.refreshToken)
        // userSession.token = token
        // userSession.refreshToken = refreshToken
        // await request.server.app.cache.set(session.sessionId, userSession)
      }

      // Set the user's details on the request object and allow the request to continue
      // Depending on the service, additional checks can be performed here before returning `isValid: true`
      return { isValid: true, credentials: userSession }
    }
  }
}

export { getBellOptions, getCookieOptions }
