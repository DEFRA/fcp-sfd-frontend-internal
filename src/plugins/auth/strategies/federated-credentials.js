import { hapiAuthOidcPlugin, WebIdentityTokenProvider, MockProvider } from '@defra/hapi-auth-oidc'
import { config } from '../../../config/index.js'

function buildAuthProvider () {
  const { audience, enableMocking } = config.get('entra.federatedCredentials')
  return enableMocking
    ? new MockProvider({})
    : new WebIdentityTokenProvider({ audience })
}

async function registerFederatedStrategy (server) {
  const clientId = config.get('entra.clientId')
  const sessionCookieSecure = config.get('server.session.cookie.secure')

  await server.register({
    plugin: hapiAuthOidcPlugin,
    options: {
      oidc: {
        discoveryUri: config.get('entra.wellKnownUrl'),
        clientId,
        authProvider: buildAuthProvider(),
        scope: `${clientId}/.default offline_access`,
        loginCallbackUri: '/auth/callback',
        responseMode: 'query',
        externalBaseUrl: config.get('entra.redirectUrl'),
        defaultPostLoginUri: '/search-sbi'
      },
      cookieOptions: {
        password: config.get('server.session.cookie.password'),
        isSecure: sessionCookieSecure,
        isSameSite: 'None'
      }
    }
  })

  server.auth.strategy('session', 'cookie', getCookieOptions())
  server.auth.default('session')
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

async function validateToken (request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  if (!userSession) {
    return { isValid: false }
  }

  try {
    const refreshedToken = await request.ensureValidToken(userSession.token)
    if (refreshedToken !== userSession.token) {
      userSession.token = refreshedToken
      await request.server.app.cache.set(session.sessionId, userSession)
    }
  } catch (err) {
    request.server?.logger?.info(err.message)
    return { isValid: false }
  }

  return { isValid: true, credentials: userSession }
}

export { registerFederatedStrategy }
