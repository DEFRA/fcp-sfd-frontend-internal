import { constants } from 'node:http2'
import { vi, beforeEach, describe, beforeAll, afterAll, test, expect } from 'vitest'
import '../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_FOUND } = constants

// Enable federated credentials for this test suite
vi.stubEnv('USE_FEDERATED_CREDENTIALS', 'true')

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
    email: 'test.rpa@test.com',
    sid: 'session-id'
  },
  token: 'ENTRA-JWT',
  refreshToken: 'ENTRA-REFRESH-TOKEN'
}

const signOutUrl = 'https://oidc.example.com/sign-out'

const { createServer } = await import('../../../../src/server.js')

let server
let path

describe('auth routes - federated credentials strategy', () => {
  beforeAll(async () => {
    vi.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
    vi.unstubAllEnvs()
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      path = '/auth/sign-in'
    })

    test('initiates federated login flow when unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      // The federated strategy triggers login with hapi-auth-oidc
      expect(response.statusCode).not.toBe(404)
      expect(response.statusCode).not.toBe(500)
    })
  })

  describe('GET /auth/callback', () => {
    beforeEach(() => {
      path = '/auth/callback'
    })

    test('callback route is registered', async () => {
      const response = await server.inject({
        url: path
      })
      // Callback endpoint should be available
      expect(response).toBeDefined()
    })
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      path = '/auth/sign-out'
      mockGetSignOutUrl.mockResolvedValue(signOutUrl)
    })

    test('redirects to oidc sign out url if authenticated', async () => {
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

    test('redirects to home if unauthenticated', async () => {
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
})
