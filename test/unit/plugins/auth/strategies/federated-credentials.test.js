import { vi, beforeEach, describe, test, expect } from 'vitest'

// Mocks
const mockConfigGet = vi.fn()
vi.mock('../../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const mockGetCookieOptions = vi.fn()
vi.mock('../../../../../src/plugins/auth/get-cookie-options.js', () => ({
  getCookieOptions: mockGetCookieOptions
}))

const mockWebIdentityTokenProvider = vi.fn()
const mockMockProvider = vi.fn()
const mockHapiAuthOidcPlugin = vi.fn()

vi.mock('@defra/hapi-auth-oidc', () => ({
  hapiAuthOidcPlugin: mockHapiAuthOidcPlugin,
  WebIdentityTokenProvider: mockWebIdentityTokenProvider,
  MockProvider: mockMockProvider
}))

// Thing under test
const { registerFederatedStrategy } = await import('../../../../../src/plugins/auth/strategies/federated-credentials.js')

describe('federated-credentials strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'entra.clientId':
          return 'mockClientId'
        case 'entra.redirectUrl':
          return 'mockRedirectUrl'
        case 'entra.wellKnownUrl':
          return 'mockWellKnownUrl'
        case 'entra.federatedCredentials':
          return { audience: 'mockAudience', enableMocking: false }
        case 'server.session.cookie.password':
          return 'mockPassword'
        case 'server.session.cookie.secure':
          return true
        default:
          return 'defaultConfigValue'
      }
    })
    mockGetCookieOptions.mockReturnValue({})
  })

  describe('registerFederatedStrategy', () => {
    let server

    beforeEach(() => {
      server = {
        register: vi.fn().mockResolvedValue(undefined),
        auth: {
          strategy: vi.fn(),
          default: vi.fn()
        }
      }
      mockGetCookieOptions.mockReturnValue({})
      mockWebIdentityTokenProvider.mockImplementation(class {})
    })

    test('should be a function', () => {
      expect(registerFederatedStrategy).toBeInstanceOf(Function)
    })

    describe('when choosing authentication provider', () => {
      describe('and enableMocking is false', () => {
        test('should use WebIdentityTokenProvider in production', async () => {
          mockWebIdentityTokenProvider.mockImplementation(class {
            constructor (config) {
              this.config = config
            }
          })

          await registerFederatedStrategy(server)

          const registrationCall = server.register.mock.calls[0][0]
          expect(registrationCall.options.oidc.authProvider).toBeInstanceOf(mockWebIdentityTokenProvider)
          expect(mockWebIdentityTokenProvider).toHaveBeenCalledWith({ audience: 'mockAudience' })
        })
      })

      describe('and enableMocking is true', () => {
        beforeEach(() => {
          mockConfigGet.mockImplementation((key) => {
            if (key === 'entra.federatedCredentials') {
              return { audience: 'mockAudience', enableMocking: true }
            }
            switch (key) {
              case 'entra.clientId':
                return 'mockClientId'
              case 'entra.redirectUrl':
                return 'mockRedirectUrl'
              case 'entra.wellKnownUrl':
                return 'mockWellKnownUrl'
              case 'server.session.cookie.password':
                return 'mockPassword'
              case 'server.session.cookie.secure':
                return true
              default:
                return 'defaultConfigValue'
            }
          })
          mockMockProvider.mockImplementation(class {
            constructor () {
              this.config = {}
            }
          })
        })

        test('should use MockProvider in development', async () => {
          await registerFederatedStrategy(server)

          const registrationCall = server.register.mock.calls[0][0]
          expect(registrationCall.options.oidc.authProvider).toBeInstanceOf(mockMockProvider)
          expect(mockMockProvider).toHaveBeenCalledWith({})
        })
      })
    })

    test('should register with correct OIDC configuration', async () => {
      await registerFederatedStrategy(server)

      const registrationCall = server.register.mock.calls[0][0]
      expect(registrationCall.options.oidc).toMatchObject({
        discoveryUri: 'mockWellKnownUrl',
        clientId: 'mockClientId',
        scope: 'mockClientId/.default offline_access',
        loginCallbackUri: '/auth/callback',
        responseMode: 'query',
        externalBaseUrl: 'mockRedirectUrl',
        defaultPostLoginUri: '/search-sbi'
      })
    })

    test('should register with cookie options', async () => {
      await registerFederatedStrategy(server)

      const registrationCall = server.register.mock.calls[0][0]
      expect(registrationCall.options.cookieOptions).toMatchObject({
        password: 'mockPassword',
        isSecure: true,
        isSameSite: 'None'
      })
    })

    test('should register session cookie strategy', async () => {
      await registerFederatedStrategy(server)

      expect(server.auth.strategy).toHaveBeenCalledWith(
        'session',
        'cookie',
        expect.any(Object)
      )
    })

    test('should set default strategy to session', async () => {
      await registerFederatedStrategy(server)

      expect(server.auth.default).toHaveBeenCalledWith('session')
    })

    test('should get cookie options with validateToken function', async () => {
      await registerFederatedStrategy(server)

      expect(mockGetCookieOptions).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('validateToken', () => {
    let validateToken
    let mockCacheGet
    let mockCacheSet
    let mockEnsureValidToken
    let request

    beforeEach(async () => {
      mockCacheGet = vi.fn()
      mockCacheSet = vi.fn()
      mockEnsureValidToken = vi.fn()

      request = {
        server: {
          app: {
            cache: {
              get: mockCacheGet,
              set: mockCacheSet
            }
          },
          logger: {
            info: vi.fn()
          }
        },
        ensureValidToken: mockEnsureValidToken
      }

      // Get validateToken from the getCookieOptions call
      mockWebIdentityTokenProvider.mockImplementation(class {})
      mockGetCookieOptions.mockImplementation((fn) => {
        validateToken = fn
        return {
          cookie: {},
          redirectTo: () => {},
          validate: fn
        }
      })

      await registerFederatedStrategy({
        register: vi.fn().mockResolvedValue(undefined),
        auth: { strategy: vi.fn(), default: vi.fn() }
      })
    })

    test('should return invalid state if session does not exist', async () => {
      mockCacheGet.mockResolvedValue(null)

      const result = await validateToken(request, { sessionId: 'session-id' })

      expect(result.isValid).toBe(false)
    })

    test('should get session from cache', async () => {
      mockCacheGet.mockResolvedValue({ token: 'test-token' })
      mockEnsureValidToken.mockResolvedValue('test-token')

      await validateToken(request, { sessionId: 'session-id' })

      expect(mockCacheGet).toHaveBeenCalledWith('session-id')
    })

    test('should ensure token is valid', async () => {
      mockCacheGet.mockResolvedValue({ token: 'test-token' })
      mockEnsureValidToken.mockResolvedValue('test-token')

      await validateToken(request, { sessionId: 'session-id' })

      expect(mockEnsureValidToken).toHaveBeenCalledWith('test-token')
    })

    test('should return valid state if session exists and token is valid', async () => {
      const userSession = { token: 'test-token' }
      mockCacheGet.mockResolvedValue(userSession)
      mockEnsureValidToken.mockResolvedValue('test-token')

      const result = await validateToken(request, { sessionId: 'session-id' })

      expect(result.isValid).toBe(true)
      expect(result.credentials).toEqual(userSession)
    })

    test('should update session if token was refreshed', async () => {
      const userSession = { token: 'old-token' }
      mockCacheGet.mockResolvedValue(userSession)
      mockEnsureValidToken.mockResolvedValue('new-token')

      await validateToken(request, { sessionId: 'session-id' })

      expect(userSession.token).toBe('new-token')
      expect(mockCacheSet).toHaveBeenCalledWith('session-id', userSession)
    })

    test('should not update cache if token was not refreshed', async () => {
      const userSession = { token: 'test-token' }
      mockCacheGet.mockResolvedValue(userSession)
      mockEnsureValidToken.mockResolvedValue('test-token')

      await validateToken(request, { sessionId: 'session-id' })

      expect(mockCacheSet).not.toHaveBeenCalled()
    })

    test('should return invalid state if token validation fails', async () => {
      mockCacheGet.mockResolvedValue({ token: 'test-token' })
      mockEnsureValidToken.mockRejectedValue(new Error('Token validation failed'))

      const result = await validateToken(request, { sessionId: 'session-id' })

      expect(result.isValid).toBe(false)
    })

    test('should log error if token validation fails', async () => {
      const error = new Error('Token validation failed')
      mockCacheGet.mockResolvedValue({ token: 'test-token' })
      mockEnsureValidToken.mockRejectedValue(error)

      await validateToken(request, { sessionId: 'session-id' })

      expect(request.server.logger.info).toHaveBeenCalledWith(error.message)
    })
  })
})
