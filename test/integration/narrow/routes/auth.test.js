import { constants } from 'node:http2'
import { vi, beforeEach, describe, beforeAll, afterAll, test, expect } from 'vitest'
import { mockOidcConfig } from '../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_FOUND } = constants

const mockVerifyToken = vi.fn()
vi.mock('../../../../src/auth/verify-token', async () => ({
  verifyToken: mockVerifyToken
}))

const mockGetPermissions = vi.fn()
vi.mock('../../../../src/auth/get-permissions.js', async () => ({
  getPermissions: mockGetPermissions
}))

const mockGetSafeRedirect = vi.fn()
vi.mock('../../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: mockGetSafeRedirect
}))

const mockGetSignOutUrl = vi.fn()
vi.mock('../../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: mockGetSignOutUrl
}))

const mockValidateState = vi.fn()
vi.mock('../../../../src/auth/state.js', () => ({
  validateState: mockValidateState
}))

const credentials = {
  sessionId: 'session-id',
  profile: {
    sessionId: 'session-id',
    crn: '1234567890',
    organisationId: '1234567',
    sbi: '653754363',
    email: 'test.farmer@test.com'
  },
  token: 'DEFRA-ID-JWT',
  refreshToken: 'DEFRA-ID-REFRESH-TOKEN'
}

const role = 'Farmer'
const scope = ['user']

const signOutUrl = 'https://oidc.example.com/sign-out'

const { createServer } = await import('../../../../src/server.js')

let server
let path

describe('auth routes', () => {
  beforeAll(async () => {
    vi.clearAllMocks()

    mockGetSafeRedirect.mockReturnValue('/home')

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      path = '/auth/sign-in'
    })

    test('redirects to /home if authenticated', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/home')
    })

    test('redirects to oidc sign in if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(redirect.origin).toBe('https://oidc.example.com')
      expect(redirect.pathname).toBe('/authorize')
      expect(params.get('serviceId')).toBe(process.env.DEFRA_ID_SERVICE_ID)
      expect(params.get('p')).toBe(process.env.DEFRA_ID_POLICY)
      expect(params.get('response_mode')).toBe('query')
      expect(params.get('client_id')).toBe(process.env.DEFRA_ID_CLIENT_ID)
      expect(params.get('response_type')).toBe('code')
      expect(params.get('redirect_uri')).toBe(process.env.DEFRA_ID_REDIRECT_URL)
      expect(params.get('state')).toBeDefined()
      expect(params.get('scope')).toBe(`openid offline_access ${process.env.DEFRA_ID_CLIENT_ID}`)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    beforeEach(() => {
      path = '/auth/sign-in-oidc'
      mockGetPermissions.mockResolvedValue({ role, scope })
    })

    test('redirects to oidc sign in page if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location.startsWith(mockOidcConfig.authorization_endpoint)).toBe(true)
    })

    test('should return unauthorised view if unauthenticated but redirected from Entra', async () => {
      // This scenario will only occur if the user has completed the Entra sign in process but did not start from the application
      // ie they have bookmarked the Entra sign in page or have navigated directly to it

      // To test this routing, we need to run Bell in simulation mode so the authentication flow is automatically completed
      const Bell = await import('@hapi/bell')
      Bell.simulate(() => {})

      // Because this needs to be set before the server is created, we'll create a new server instance to avoid conflicts with the existing tests
      const { createServer: createBellSimulatedServer } = await import('../../../../src/server.js')
      const bellSimulatedServer = await createBellSimulatedServer()
      await bellSimulatedServer.initialize()

      const response = await bellSimulatedServer.inject({
        url: `${path}?state=state&code=code`
      })

      bellSimulatedServer.stop()

      expect(response.request.response.source.template).toBe('unauthorised')
    })

    test('should verify JWT token against public key', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      expect(mockVerifyToken).toHaveBeenCalledWith(credentials.token)
    })

    test('should get user permissions', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      const { sbi, crn } = credentials.profile
      expect(mockGetPermissions).toHaveBeenCalledWith(sbi, crn)
    })

    test('should set authentication status in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.isAuthenticated).toBe(true)
    })

    test('should set user profile properties at top level in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.crn).toBe(credentials.profile.crn)
      expect(cache.organisationId).toBe(credentials.profile.organisationId)
    })

    test('should set token and refresh token in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.token).toBe(credentials.token)
      expect(cache.refreshToken).toBe(credentials.refreshToken)
    })

    test('should set cookie session', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie).not.toMatch(/Expires=/)
      expect(sessionCookie).not.toMatch(/Max-Age=/)
    })

    test('should ensure redirect path is safe', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      expect(mockGetSafeRedirect).toHaveBeenCalledWith('/home')
    })

    test('redirects to safe redirect path', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/home')
    })
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      path = '/auth/sign-out'
      mockGetSignOutUrl.mockResolvedValue(signOutUrl)
    })

    test('redirects to oidc sign out url if authenticated with session cookie', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(signOutUrl)
    })

    test('redirects to index page if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/')
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      path = '/auth/sign-out-oidc'
    })

    test('should validate state if authenticated', async () => {
      const state = 'state'
      await server.inject({
        url: `${path}?state=${state}`,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(mockValidateState).toHaveBeenCalledWith(expect.anything(), state)
    })

    test('should not validate state if unauthenticated', async () => {
      await server.inject({
        url: path
      })
      expect(mockValidateState).not.toHaveBeenCalled()
    })

    test('should clear session cache if authenticated and session id', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache).toBeNull()
    })

    test('should clear session cookie if authenticated and session id', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie).toMatch(/Expires=/)
      expect(sessionCookie).toMatch(/Max-Age=0/)
    })

    test('should clear session cookie if authenticated and no session id', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials: {
            ...credentials,
            sessionId: null
          }
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie).toMatch(/Expires=/)
      expect(sessionCookie).toMatch(/Max-Age=0/)
    })

    test('should redirect to signed out page if authenticated', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/signed-out')
    })

    test('should redirect to signed out page if not authenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/signed-out')
    })
  })

  describe('GET /auth/organisation', () => {
    beforeEach(() => {
      path = '/auth/organisation'
    })

    test('redirects to oidc sign in', async () => {
      const response = await server.inject({
        url: path
      })

      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(redirect.origin).toBe('https://oidc.example.com')
      expect(redirect.pathname).toBe('/authorize')
      expect(params.get('serviceId')).toBe(process.env.DEFRA_ID_SERVICE_ID)
      expect(params.get('p')).toBe(process.env.DEFRA_ID_POLICY)
      expect(params.get('response_mode')).toBe('query')
      expect(params.get('client_id')).toBe(process.env.DEFRA_ID_CLIENT_ID)
      expect(params.get('response_type')).toBe('code')
      expect(params.get('redirect_uri')).toBe(process.env.DEFRA_ID_REDIRECT_URL)
      expect(params.get('state')).toBeDefined()
      expect(params.get('scope')).toBe(`openid offline_access ${process.env.DEFRA_ID_CLIENT_ID}`)
    })

    test('redirects to oidc sign in with "forceReselection" parameter', async () => {
      const response = await server.inject({
        url: path
      })

      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(params.get('forceReselection')).toBe('true')
    })

    test('redirects to oidc sign in with "relationshipId" parameter if preselected organisation provided', async () => {
      const response = await server.inject({
        url: `${path}?organisationId=1234567`
      })
      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(params.get('relationshipId')).toBe('1234567')
    })

    test('redirects to safe redirect path if authenticated', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'entra',
          credentials
        }
      })
      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe('/home')
    })
  })
})
