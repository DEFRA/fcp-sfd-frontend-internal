// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mocks
const { mockJwtDecode } = vi.hoisted(() => ({
  mockJwtDecode: vi.fn()
}))

vi.mock('@hapi/jwt', () => ({
  default: {
    token: {
      decode: mockJwtDecode
    }
  }
}))

vi.mock('../../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: vi.fn()
}))

vi.mock('../../../../src/auth/state.js', () => ({
  validateState: vi.fn()
}))

vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'featureToggle.useDalTestEmail') return false
      return null
    })
  }
}))

// Thing under test
import { federatedRoutes } from '../../../../src/routes/auth/federated-routes.js'
import { getSignOutUrl } from '../../../../src/auth/get-sign-out-url.js'
import { validateState } from '../../../../src/auth/state.js'

const [signIn, callback, signOut, signOutOidc] = federatedRoutes

describe('federated-routes', () => {
  test('should return an array of routes', () => {
    expect(federatedRoutes).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    let request
    let h

    beforeEach(() => {
      vi.clearAllMocks()
      request = {
        login: vi.fn()
      }
      h = {}
    })

    test('should have the correct method and path configured', () => {
      expect(signIn.method).toBe('GET')
      expect(signIn.path).toBe('/auth/sign-in')
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(signIn.options.auth.mode).toBe('try')
      expect(signIn.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(signIn.handler).toBeInstanceOf(Function)
    })

    test('should call request.login with response handler', async () => {
      await signIn.handler(request, h)

      expect(request.login).toHaveBeenCalledWith(h)
    })
  })

  describe('GET /auth/callback', () => {
    let request
    let h
    let cacheStub

    beforeEach(() => {
      vi.clearAllMocks()
      cacheStub = {
        set: vi.fn()
      }
      request = {
        callback: vi.fn(),
        server: {
          app: {
            cache: cacheStub
          }
        },
        cookieAuth: {
          set: vi.fn()
        },
        yar: {
          get: vi.fn(),
          clear: vi.fn()
        }
      }
      h = {
        redirect: vi.fn()
      }
      mockJwtDecode.mockReturnValue({
        decoded: {
          payload: {
            sid: 'session-123',
            roles: ['admin'],
            email: 'test@example.com',
            login_hint: 'user@example.com'
          }
        }
      })
    })

    test('should have the correct method and path configured', () => {
      expect(callback.method).toBe('GET')
      expect(callback.path).toBe('/auth/callback')
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(callback.options.auth.mode).toBe('try')
      expect(callback.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(callback.handler).toBeInstanceOf(Function)
    })

    test('should decode token and store credentials in session cache', async () => {
      request.callback.mockResolvedValue({
        tokens: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        }
      })
      request.yar.get.mockReturnValue(undefined)

      await callback.handler(request, h)

      expect(cacheStub.set).toHaveBeenCalledWith('session-123', expect.objectContaining({
        isAuthenticated: true,
        email: 'test@example.com',
        sessionId: 'session-123',
        scope: ['admin']
      }))
    })

    test('should set cookie authentication with session ID', async () => {
      request.callback.mockResolvedValue({
        tokens: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        }
      })
      request.yar.get.mockReturnValue(undefined)

      await callback.handler(request, h)

      expect(request.cookieAuth.set).toHaveBeenCalledWith({ sessionId: 'session-123' })
    })

    test('should redirect to saved redirect URL if available', async () => {
      request.callback.mockResolvedValue({
        tokens: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        }
      })
      request.yar.get.mockReturnValue('/business/123/details')

      await callback.handler(request, h)

      expect(request.yar.clear).toHaveBeenCalledWith('redirect')
      expect(h.redirect).toHaveBeenCalledWith('/business/123/details')
    })

    test('should redirect to /search-sbi if no saved redirect URL', async () => {
      request.callback.mockResolvedValue({
        tokens: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        }
      })
      request.yar.get.mockReturnValue(undefined)

      await callback.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
    })
  })

  describe('GET /auth/sign-out', () => {
    let request
    let h

    beforeEach(() => {
      vi.clearAllMocks()
      request = {
        yar: {
          reset: vi.fn()
        },
        auth: {
          isAuthenticated: false,
          credentials: {}
        }
      }
      h = {
        redirect: vi.fn()
      }
    })

    test('should have the correct method and path configured', () => {
      expect(signOut.method).toBe('GET')
      expect(signOut.path).toBe('/auth/sign-out')
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(signOut.options.auth.mode).toBe('try')
      expect(signOut.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(signOut.handler).toBeInstanceOf(Function)
    })

    test('should redirect to home if user is not authenticated', async () => {
      request.auth.isAuthenticated = false

      await signOut.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/')
    })

    test('should get sign out URL and redirect if user is authenticated', async () => {
      request.auth.isAuthenticated = true
      request.auth.credentials = { loginHint: 'user@example.com' }
      getSignOutUrl.mockResolvedValue('https://entra.example.com/logout')

      await signOut.handler(request, h)

      expect(request.yar.reset).toHaveBeenCalled()
      expect(getSignOutUrl).toHaveBeenCalledWith(request, 'user@example.com')
      expect(h.redirect).toHaveBeenCalledWith('https://entra.example.com/logout')
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    let request
    let h
    let cacheStub

    beforeEach(() => {
      vi.clearAllMocks()
      cacheStub = {
        drop: vi.fn()
      }
      request = {
        auth: {
          isAuthenticated: false,
          credentials: {}
        },
        query: { state: 'state-123' },
        server: {
          app: {
            cache: cacheStub
          }
        },
        cookieAuth: {
          clear: vi.fn()
        }
      }
      h = {
        redirect: vi.fn()
      }
    })

    test('should have the correct method and path configured', () => {
      expect(signOutOidc.method).toBe('GET')
      expect(signOutOidc.path).toBe('/auth/sign-out-oidc')
    })

    test('should attempt to authenticate with default strategy', () => {
      expect(signOutOidc.options.auth.strategy).toBeUndefined()
      expect(signOutOidc.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signOutOidc.handler).toBeInstanceOf(Function)
    })

    test('should redirect to /signed-out if user is not authenticated', async () => {
      request.auth.isAuthenticated = false

      await signOutOidc.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/signed-out')
      expect(validateState).not.toHaveBeenCalled()
    })

    test('should validate state and clear session cache if user is authenticated', async () => {
      request.auth.isAuthenticated = true
      request.auth.credentials = { sessionId: 'session-123' }

      await signOutOidc.handler(request, h)

      expect(validateState).toHaveBeenCalledWith(request, 'state-123')
      expect(cacheStub.drop).toHaveBeenCalledWith('session-123')
      expect(request.cookieAuth.clear).toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith('/signed-out')
    })

    test('should not drop cache if session ID is not present', async () => {
      request.auth.isAuthenticated = true
      request.auth.credentials = {}

      await signOutOidc.handler(request, h)

      expect(validateState).toHaveBeenCalledWith(request, 'state-123')
      expect(cacheStub.drop).not.toHaveBeenCalled()
      expect(request.cookieAuth.clear).toHaveBeenCalled()
    })
  })
})
