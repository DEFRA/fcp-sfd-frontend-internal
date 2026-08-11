import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockGetSignOutUrl = vi.fn()
vi.mock('../../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: mockGetSignOutUrl
}))

const mockValidateState = vi.fn()
vi.mock('../../../../src/auth/state.js', () => ({
  validateState: mockValidateState
}))

const mockConfigGet = vi.fn()
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

vi.mock('@hapi/jwt', () => ({
  default: {
    token: {
      decode: vi.fn((token) => ({
        decoded: {
          payload: {
            sid: 'test-session-id',
            email: 'test@example.com',
            login_hint: 'test-login-hint',
            roles: ['role1']
          }
        }
      }))
    }
  }
}))

const { federatedRoutes } = await import('../../../../src/routes/auth/federated-routes.js')

const [signIn, callback, signOut, signOutOidc] = federatedRoutes

describe('federated-routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      const config = {
        'featureToggle.useDalTestEmail': false,
        'entra.federatedCredentials.audience': 'mockAudience'
      }
      return config[key]
    })
  })

  test('should return an array of routes', () => {
    expect(federatedRoutes).toBeInstanceOf(Array)
    expect(federatedRoutes).toHaveLength(4)
  })

  describe('GET /auth/sign-in', () => {
    test('should have the correct method and path configured', () => {
      expect(signIn.method).toBe('GET')
      expect(signIn.path).toBe('/auth/sign-in')
    })

    test('should have auth mode try', () => {
      expect(signIn.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signIn.handler).toBeInstanceOf(Function)
    })

    test('should call request.login', async () => {
      const mockRequest = {
        login: vi.fn()
      }
      const mockH = {}

      await signIn.handler(mockRequest, mockH)

      expect(mockRequest.login).toHaveBeenCalledWith(mockH)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    test('should have the correct method and path configured', () => {
      expect(callback.method).toBe('GET')
      expect(callback.path).toBe('/auth/sign-in-oidc')
    })

    test('should have auth mode try', () => {
      expect(callback.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(callback.handler).toBeInstanceOf(Function)
    })

    test('should create session cache and set cookie', async () => {
      const mockCache = {
        set: vi.fn()
      }
      const mockRequest = {
        callback: vi.fn().mockResolvedValue({
          tokens: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token'
          },
          expiresIn: 3600,
          claims: { oid: 'test-oid' }
        }),
        server: {
          app: {
            cache: mockCache
          }
        },
        cookieAuth: {
          set: vi.fn()
        },
        yar: {
          get: vi.fn().mockReturnValue('/some-page'),
          clear: vi.fn()
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await callback.handler(mockRequest, mockH)

      expect(mockRequest.server.app.cache.set).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          isAuthenticated: true,
          sessionId: 'test-session-id',
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600000,
          audience: 'mockAudience'
        })
      )
      expect(mockRequest.cookieAuth.set).toHaveBeenCalledWith({ sessionId: 'test-session-id' })
    })

    test('should redirect to saved redirect or search-sbi', async () => {
      const mockRequest = {
        callback: vi.fn().mockResolvedValue({
          tokens: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token'
          }
        }),
        server: {
          app: {
            cache: {
              set: vi.fn()
            }
          }
        },
        cookieAuth: {
          set: vi.fn()
        },
        yar: {
          get: vi.fn().mockReturnValue('/some-page'),
          clear: vi.fn()
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await callback.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/some-page')
    })

    test('should return unauthorised if sessionId missing', async () => {
      const mockRequest = {
        callback: vi.fn().mockResolvedValue({
          tokens: {
            access_token: 'test-token-no-sid',
            refresh_token: 'test-refresh-token'
          }
        })
      }
      const mockH = {
        view: vi.fn()
      }

      // Mock JWT decode to return null sessionId
      vi.mocked(await import('@hapi/jwt')).default.token.decode.mockReturnValueOnce({
        decoded: {
          payload: {
            sid: null
          }
        }
      })

      await callback.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('unauthorised')
    })
  })

  describe('GET /auth/sign-out', () => {
    test('should have the correct method and path configured', () => {
      expect(signOut.method).toBe('GET')
      expect(signOut.path).toBe('/auth/sign-out')
    })

    test('should have auth mode try', () => {
      expect(signOut.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signOut.handler).toBeInstanceOf(Function)
    })

    test('should redirect to home if not authenticated', async () => {
      const mockRequest = {
        yar: {
          reset: vi.fn()
        },
        auth: {
          isAuthenticated: false
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await signOut.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/')
    })

    test('should get sign out URL and redirect if authenticated', async () => {
      mockGetSignOutUrl.mockResolvedValue('https://example.com/sign-out')

      const mockRequest = {
        yar: {
          reset: vi.fn()
        },
        auth: {
          isAuthenticated: true,
          credentials: {
            loginHint: 'test-hint'
          }
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await signOut.handler(mockRequest, mockH)

      expect(mockGetSignOutUrl).toHaveBeenCalledWith(mockRequest, 'test-hint')
      expect(mockH.redirect).toHaveBeenCalledWith('https://example.com/sign-out')
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    test('should have the correct method and path configured', () => {
      expect(signOutOidc.method).toBe('GET')
      expect(signOutOidc.path).toBe('/auth/sign-out-oidc')
    })

    test('should have auth mode try', () => {
      expect(signOutOidc.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signOutOidc.handler).toBeInstanceOf(Function)
    })

    test('should clear session if authenticated and redirect to signed-out', async () => {
      const mockCacheDrop = vi.fn()
      const mockRequest = {
        auth: {
          isAuthenticated: true,
          credentials: {
            sessionId: 'test-session-id'
          }
        },
        query: {
          state: 'test-state'
        },
        server: {
          app: {
            cache: {
              drop: mockCacheDrop
            }
          }
        },
        cookieAuth: {
          clear: vi.fn()
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await signOutOidc.handler(mockRequest, mockH)

      expect(mockValidateState).toHaveBeenCalledWith(mockRequest, 'test-state')
      expect(mockCacheDrop).toHaveBeenCalledWith('test-session-id')
      expect(mockRequest.cookieAuth.clear).toHaveBeenCalled()
      expect(mockH.redirect).toHaveBeenCalledWith('/signed-out')
    })

    test('should just redirect if not authenticated', async () => {
      const mockRequest = {
        auth: {
          isAuthenticated: false
        },
        query: {
          state: 'test-state'
        }
      }
      const mockH = {
        redirect: vi.fn()
      }

      await signOutOidc.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/signed-out')
    })
  })
})
