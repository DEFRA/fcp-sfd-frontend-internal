import Jwt from '@hapi/jwt'
import { getOidcConfig } from '../../../auth/get-oidc-config.js'
import { refreshTokens } from '../../../auth/refresh-tokens.js'
import { getSafeRedirect } from '../../../utils/get-safe-redirect.js'
import { config } from '../../../config/index.js'

async function registerClientSecretStrategy (server) {
  const oidcConfig = await getOidcConfig()

  server.auth.strategy('entra', 'bell', getBellOptions(oidcConfig))
  server.auth.strategy('session', 'cookie', getCookieOptions())
  server.auth.default('session')
}

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

function getCookieOptions () {
  const sessionCookieSecure = config.get('server.session.cookie.secure')

  return {
    cookie: {
      password: config.get('server.session.cookie.password'),
      path: '/',
      isSecure: sessionCookieSecure,
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

  credentials.profile = {
    ...payload,
    sessionId: payload.sid,
    loginHint: payload.login_hint
  }
}

async function validateToken (request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  if (!userSession) {
    return { isValid: false }
  }

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

  return { isValid: true, credentials: userSession }
}

export { registerClientSecretStrategy, getBellOptions, getCookieOptions }
