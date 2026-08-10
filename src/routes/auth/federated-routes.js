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

    const { tokens, expiresIn, claims } = credentials
    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token

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

    // Store the session following CDP hapi-auth-oidc pattern.
    // Include expiry metadata so ensureValidToken can determine when to refresh.
    // This matches the saveUserSession pattern from the CDP docs.
    const expiresInMs = expiresIn ? expiresIn * 1000 : undefined
    const session = {
      isAuthenticated: true,
      ...profile,
      scope: roles,
      accessToken,
      refreshToken,
      expiresIn: expiresInMs,
      claims
    }

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
