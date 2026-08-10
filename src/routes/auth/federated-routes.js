import Jwt from '@hapi/jwt'
import { getSignOutUrl } from '../../auth/get-sign-out-url.js'
import { validateState } from '../../auth/state.js'
import { config } from '../../config/index.js'

const signIn = {
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    // @defra/hapi-auth-oidc requires manual login initiation via request.login() method
    return request.login(h)
  }
}

const callback = {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    const credentials = await request.callback(h)

    // Debug: log the full structure returned by hapi-auth-oidc
    console.error('[DEBUG] request.callback response structure:', JSON.stringify(credentials, null, 2))

    const { tokens } = credentials
    const accessToken = tokens.access_token

    const decoded = Jwt.token.decode(accessToken).decoded.payload
    const sessionId = decoded?.sid

    if (!sessionId) {
      return h.view('unauthorised')
    }

    const roles = decoded.roles

    const profile = {
      ...decoded,
      sessionId,
      loginHint: decoded.login_hint
    }

    if (config.get('featureToggle.useDalTestEmail')) {
      profile.email = config.get('dalConfig.emailHeader')
    }

    // Store the full credentials response to ensure ensureValidToken has all the context it needs
    // for token refresh operations (audience context, expiry info, etc.)
    const session = {
      isAuthenticated: true,
      ...profile,
      scope: roles,
      ...credentials // Spread the full credentials to preserve all metadata
    }

    console.error('[DEBUG] storing session in cache:', JSON.stringify({ sessionId, session }, null, 2))

    await request.server.app.cache.set(sessionId, session)

    request.cookieAuth.set({ sessionId })

    const redirect = request.yar.get('redirect')
    request.yar.clear('redirect')

    return h.redirect(redirect || '/search-sbi')
  }
}

const signOut = {
  method: 'GET',
  path: '/auth/sign-out',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    await request.yar.reset()

    if (!request.auth.isAuthenticated) {
      return h.redirect('/')
    }

    const signOutUrl = await getSignOutUrl(request, request.auth.credentials.loginHint)
    return h.redirect(signOutUrl)
  }
}

const signOutOidc = {
  method: 'GET',
  path: '/auth/sign-out-oidc',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    if (request.auth.isAuthenticated) {
      validateState(request, request.query.state)

      if (request.auth.credentials?.sessionId) {
        await request.server.app.cache.drop(request.auth.credentials.sessionId)
      }
      request.cookieAuth.clear()
    }
    return h.redirect('/signed-out')
  }
}

export const federatedRoutes = [
  signIn,
  callback,
  signOut,
  signOutOidc
]
