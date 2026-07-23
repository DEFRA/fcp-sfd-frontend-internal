import { config } from '../../config/index.js'

/**
 * Creates the cookie configuration that keeps users logged in.
 *
 * If the session cookie doesn't exist or has expired, users are redirected to the
 * sign-in page with their original URL preserved in the redirect parameter so they
 * can be sent back to the intended page after logging in.
 *
 * SameSite is set to 'Lax' to allow post-login redirects while maintaining security.
 *
 * @param {Function} validateToken - The token validation function to use on each request
 * @returns {object} The configuration Hapi needs to handle session cookies
 */
function getCookieOptions (validateToken) {
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

export { getCookieOptions }
