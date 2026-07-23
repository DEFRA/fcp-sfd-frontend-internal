// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mocks
vi.mock('../../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: vi.fn()
}))

vi.mock('../../../../src/auth/state.js', () => ({
  validateState: vi.fn()
}))

vi.mock('../../../../src/auth/verify-token.js', () => ({
  verifyToken: vi.fn()
}))

vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

// Thing under test
import { clientSecretRoutes } from '../../../../src/routes/auth/client-secret-routes.js'
import { getSignOutUrl } from '../../../../src/auth/get-sign-out-url.js'
import { validateState } from '../../../../src/auth/state.js'
import { verifyToken } from '../../../../src/auth/verify-token.js'
import { config } from '../../../../src/config/index.js'

const [signIn, signInOidc, signOut, signOutOidc] = clientSecretRoutes

describe('client-secret-routes', () => {
  test('should return an array of routes', () => {
    expect(clientSecretRoutes).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    test('should have the correct method and path configured', () => {
      expect(signIn.method).toBe('GET')
      expect(signIn.path).toBe('/auth/sign-in')
    })

    test('should require authentication with Entra', () => {
      expect(signIn.options.auth).toBe('entra')
    })

    test('should have a handler', () => {
      expect(signIn.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    test('should have the correct method and path configured', () => {
      expect(signInOidc.method).toBe('GET')
      expect(signInOidc.path).toBe('/auth/sign-in-oidc')
    })

    test('should attempt authentication with Entra', () => {
      expect(signInOidc.options.auth.strategy).toBe('entra')
      expect(signInOidc.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signInOidc.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out', () => {
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
  })

  describe('GET /auth/sign-out-oidc', () => {
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
  })

  describe('POST /auth/sign-in-oidc handler', () => {
    let request
    let h

    beforeEach(() => {
      vi.clearAllMocks()
      config.get.mockImplementation((key) => {
        if (key === 'featureToggle.useDalTestEmail') return false
        return null
      })

      h = {
        view: vi.fn(),
        redirect: vi.fn().mockReturnValue('redirect-response')
      }

      request = {
        auth: {
          isAuthenticated: true,
          credentials: {
            profile: {
              given_name: 'John',
              family_name: 'Doe',
              email: 'john@example.com',
              sessionId: 'session-123',
              roles: ['admin']
            },
            token: 'token-123',
            refreshToken: 'refresh-token-123'
          }
        },
        server: {
          app: {
            cache: {
              set: vi.fn().mockResolvedValue(undefined)
            }
          }
        },
        cookieAuth: {
          set: vi.fn()
        },
        yar: {
          clear: vi.fn(),
          set: vi.fn()
        }
      }
    })

    test('should return unauthorised view when not authenticated', async () => {
      request.auth.isAuthenticated = false
      await signInOidc.handler(request, h)
      expect(h.view).toHaveBeenCalledWith('unauthorised')
    })

    test('should verify token when authenticated', async () => {
      await signInOidc.handler(request, h)
      expect(verifyToken).toHaveBeenCalledWith('token-123')
    })

    test('should extract profile, token and refresh token from credentials', async () => {
      await signInOidc.handler(request, h)
      expect(verifyToken).toHaveBeenCalled()
    })

    test('should set session in cache with correct structure', async () => {
      await signInOidc.handler(request, h)
      expect(request.server.app.cache.set).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          isAuthenticated: true,
          given_name: 'John',
          family_name: 'Doe',
          email: 'john@example.com',
          sessionId: 'session-123',
          roles: ['admin'],
          scope: ['admin'],
          token: 'token-123',
          refreshToken: 'refresh-token-123'
        })
      )
    })

    test('should set cookie auth with session id', async () => {
      await signInOidc.handler(request, h)
      expect(request.cookieAuth.set).toHaveBeenCalledWith({ sessionId: 'session-123' })
    })

    test('should clear redirect session variable', async () => {
      await signInOidc.handler(request, h)
      expect(request.yar.clear).toHaveBeenCalledWith('redirect')
    })

    test('should redirect to search-sbi', async () => {
      await signInOidc.handler(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
    })

    describe('when DAL test email feature is enabled', () => {
      beforeEach(() => {
        config.get.mockImplementation((key) => {
          if (key === 'featureToggle.useDalTestEmail') return true
          if (key === 'dalConfig.emailHeader') return 'test@dal.example.com'
          return null
        })
      })

      test('should update profile email with DAL test email', async () => {
        await signInOidc.handler(request, h)
        expect(request.server.app.cache.set).toHaveBeenCalledWith(
          'session-123',
          expect.objectContaining({
            email: 'test@dal.example.com'
          })
        )
      })
    })
  })

  describe('GET /auth/sign-out handler', () => {
    let request
    let h

    beforeEach(() => {
      vi.clearAllMocks()
      getSignOutUrl.mockResolvedValue('https://entra.microsoft.com/sign-out')

      h = {
        redirect: vi.fn().mockReturnValue('redirect-response')
      }

      request = {
        auth: {
          isAuthenticated: true,
          credentials: {
            loginHint: 'user@example.com'
          }
        },
        yar: {
          reset: vi.fn().mockResolvedValue(undefined)
        },
        server: vi.fn()
      }
    })

    test('should reset session', async () => {
      await signOut.handler(request, h)
      expect(request.yar.reset).toHaveBeenCalled()
    })

    test('should redirect to home when not authenticated', async () => {
      request.auth.isAuthenticated = false
      await signOut.handler(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/')
    })

    test('should get sign out url with login hint when authenticated', async () => {
      await signOut.handler(request, h)
      expect(getSignOutUrl).toHaveBeenCalledWith(request, 'user@example.com')
    })

    test('should redirect to sign out url when authenticated', async () => {
      await signOut.handler(request, h)
      expect(h.redirect).toHaveBeenCalledWith('https://entra.microsoft.com/sign-out')
    })

    test('should not attempt to get sign out url when not authenticated', async () => {
      request.auth.isAuthenticated = false
      await signOut.handler(request, h)
      expect(getSignOutUrl).not.toHaveBeenCalled()
    })
  })

  describe('GET /auth/sign-out-oidc handler', () => {
    let request
    let h

    beforeEach(() => {
      vi.clearAllMocks()
      validateState.mockReturnValue(undefined)

      h = {
        redirect: vi.fn().mockReturnValue('redirect-response')
      }

      request = {
        auth: {
          isAuthenticated: true,
          credentials: {
            sessionId: 'session-123'
          }
        },
        query: {
          state: 'state-value-123'
        },
        server: {
          app: {
            cache: {
              drop: vi.fn().mockResolvedValue(undefined)
            }
          }
        },
        cookieAuth: {
          clear: vi.fn()
        }
      }
    })

    test('should redirect to signed-out page', async () => {
      await signOutOidc.handler(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/signed-out')
    })

    describe('when authenticated', () => {
      test('should validate state', async () => {
        await signOutOidc.handler(request, h)
        expect(validateState).toHaveBeenCalledWith(request, 'state-value-123')
      })

      test('should drop session from cache', async () => {
        await signOutOidc.handler(request, h)
        expect(request.server.app.cache.drop).toHaveBeenCalledWith('session-123')
      })

      test('should clear cookie auth', async () => {
        await signOutOidc.handler(request, h)
        expect(request.cookieAuth.clear).toHaveBeenCalled()
      })
    })

    describe('when not authenticated', () => {
      beforeEach(() => {
        request.auth.isAuthenticated = false
      })

      test('should redirect to signed-out page', async () => {
        await signOutOidc.handler(request, h)
        expect(h.redirect).toHaveBeenCalledWith('/signed-out')
      })

      test('should not validate state', async () => {
        await signOutOidc.handler(request, h)
        expect(validateState).not.toHaveBeenCalled()
      })

      test('should not drop session from cache', async () => {
        await signOutOidc.handler(request, h)
        expect(request.server.app.cache.drop).not.toHaveBeenCalled()
      })

      test('should not clear cookie auth', async () => {
        await signOutOidc.handler(request, h)
        expect(request.cookieAuth.clear).not.toHaveBeenCalled()
      })
    })

    describe('when authenticated but no sessionId in credentials', () => {
      beforeEach(() => {
        request.auth.credentials = {}
      })

      test('should not drop session from cache', async () => {
        await signOutOidc.handler(request, h)
        expect(request.server.app.cache.drop).not.toHaveBeenCalled()
      })

      test('should still clear cookie auth', async () => {
        await signOutOidc.handler(request, h)
        expect(request.cookieAuth.clear).toHaveBeenCalled()
      })

      test('should redirect to signed-out page', async () => {
        await signOutOidc.handler(request, h)
        expect(h.redirect).toHaveBeenCalledWith('/signed-out')
      })
    })
  })
})
