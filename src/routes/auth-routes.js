import { getSignOutUrl } from '../auth/get-sign-out-url.js'
import { validateState } from '../auth/state.js'
import { verifyToken } from '../auth/verify-token.js'
import { config } from '../config/index.js'

const signIn = {
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: 'entra'
  },
  handler: function (_request, h) {
    return h.redirect('/search-sbi')
  }
}

const signInOidc = {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: { strategy: 'entra', mode: 'try' }
  },
  handler: async function (request, h) {
    // If the user is not authenticated, redirect to the home page
    // This should only occur if the user tries to access the sign-in page directly and not part of the sign-in flow
    // eg if the user has bookmarked the Entra sign-in page or they have signed out and tried to go back in the browser
    if (!request.auth.isAuthenticated) {
      return h.view('unauthorised')
    }

    const { profile, token, refreshToken } = request.auth.credentials
    // verify token returned from Entra against public key
    await verifyToken(token)

    const { sessionId, roles } = profile

    // TEMPORARY CODE FOR TESTING PURPOSES ONLY - REMOVE WHEN DAL TEST EMAIL FEATURE IS NO LONGER NEEDED
    // Check if DAL test email feature is enabled
    if (config.get('featureToggle.useDalTestEmail')) {
      profile.email = config.get('dalConfig.emailHeader')
    }

    // Store token and all useful data in the session cache
    await request.server.app.cache.set(sessionId, {
      isAuthenticated: true,
      ...profile,
      scope: roles,
      token,
      refreshToken
    })

    // Create a new session using cookie authentication strategy which is used for all subsequent requests
    request.cookieAuth.set({ sessionId })

    request.yar.clear('redirect')

    // Redirect to the search sbi page
    return h.redirect('/search-sbi')
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
        // Clear the session cache
        await request.server.app.cache.drop(request.auth.credentials.sessionId)
      }
      request.cookieAuth.clear()
    }
    return h.redirect('/signed-out')
  }
}

export const auth = [
  signIn,
  signInOidc,
  signOut,
  signOutOidc
]
