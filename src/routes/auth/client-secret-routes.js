import { getSignOutUrl } from '../../auth/get-sign-out-url.js'
import { validateState } from '../../auth/state.js'
import { verifyToken } from '../../auth/verify-token.js'
import { config } from '../../config/index.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

async function hasValidSession (request) {
  try {
    await request.server.auth.test('session', request)
    return true
  } catch {
    return false
  }
}

const signIn = {
  method: 'GET',
  path: '/auth/sign-in',
  options: {
    auth: 'entra'
  },
  handler: function (_request, h) {
    return h.redirect(SEARCH_SBI)
  }
}

const signInOidc = {
  method: 'GET',
  path: '/auth/sign-in-oidc',
  options: {
    auth: { strategy: 'entra', mode: 'try' }
  },
  handler: async function (request, h) {
    const { auth, server, logger, cookieAuth } = request

    // Entra authentication fails if the callback is replayed, eg the user presses the browser back button after
    // signing in, because Bell's single-use state cookie has already been consumed.
    // If they already have a valid session, send them to the landing page rather than showing an error.
    // Otherwise they reached the callback outside the sign-in flow, eg a bookmarked Entra sign-in page.
    if (!auth.isAuthenticated) {
      if (await hasValidSession(request)) {
        return h.redirect(SEARCH_SBI)
      }

      return h.view('unauthorised')
    }

    const { profile, token, refreshToken } = auth.credentials
    // verify token returned from Entra against public key
    await verifyToken(token)

    const { sessionId, roles } = profile

    // TEMPORARY CODE FOR TESTING PURPOSES ONLY - REMOVE WHEN DAL TEST EMAIL FEATURE IS NO LONGER NEEDED
    // Check if DAL test email feature is enabled
    if (config.get('featureToggle.useDalTestEmail')) {
      profile.email = config.get('dalConfig.emailHeader')
    }

    if (!profile.email) {
      // Claim names only - the values identify the user and must not be logged.
      logger.error({ claims: Object.keys(profile) }, 'Entra token has no claim usable as the DAL email header')
    } else {
      logger.info({ emailClaim: profile.emailClaim }, 'Resolved DAL email header from Entra claim')
    }

    // Store token and all useful data in the session cache
    await server.app.cache.set(sessionId, {
      isAuthenticated: true,
      ...profile,
      scope: roles,
      token,
      refreshToken
    })

    // Create a new session using cookie authentication strategy which is used for all subsequent requests
    cookieAuth.set({ sessionId })

    return h.redirect(SEARCH_SBI)
  }
}

const signOut = {
  method: 'GET',
  path: '/auth/sign-out',
  options: {
    auth: { mode: 'try' }
  },
  handler: async function (request, h) {
    const { auth, yar } = request

    await yar.reset()
    if (!auth.isAuthenticated) {
      return h.redirect('/')
    }
    const signOutUrl = await getSignOutUrl(request, auth.credentials.loginHint)
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
    const { auth, query, server, cookieAuth } = request

    if (auth.isAuthenticated) {
      validateState(request, query.state)
      if (auth.credentials?.sessionId) {
        await server.app.cache.drop(auth.credentials.sessionId)
      }
      cookieAuth.clear()
    }
    return h.redirect('/signed-out')
  }
}

export const clientSecretRoutes = [
  signIn,
  signInOidc,
  signOut,
  signOutOidc
]
