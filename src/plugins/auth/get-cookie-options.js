import { config } from '../../config/index.js'

/**
 * Creates the cookie configuration that keeps users logged in.
 *
 * If the session cookie doesn't exist or has expired, users are redirected to the
 * sign-in page. After signing in they always land on the SBI search page rather than
 * the page they originally requested.
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
    redirectTo: '/auth/sign-in',
    validate: async (request, session) => validateToken(request, session)
  }
}

export { getCookieOptions }
