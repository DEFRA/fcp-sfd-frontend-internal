import { vi, beforeEach, describe, test, expect } from 'vitest'
import { generateKeyPairSync } from 'crypto'
import { mockOidcConfig } from '../../../../mocks/setup-server-mocks.js'
import Jwt from '@hapi/jwt'

// Mocks
const jwtDecodeSpy = vi.spyOn(Jwt.token, 'decode')
const jwtVerifyTimeSpy = vi.spyOn(Jwt.token, 'verifyTime')

const mockConfigGet = vi.fn()
vi.mock('../../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const mockGetSafeRedirect = vi.fn()
vi.mock('../../../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: mockGetSafeRedirect
}))

const mockRefreshTokens = vi.fn()
vi.mock('../../../../../src/auth/refresh-tokens.js', () => ({
  refreshTokens: mockRefreshTokens
}))

// Test helpers

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'jwk'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

const token = {
  given_name: 'Andrew',
  family_name: 'RPA',
  email: 'test.rpa@test.com',
  sid: 'session-id'
}

// Thing under test
const { registerClientSecretStrategy, getBellOptions, validateToken } = await import('../../../../../src/plugins/auth/strategies/client-secret.js')

describe('client-secret strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'entra.clientId':
          return 'mockClientId'
        case 'entra.clientSecret':
          return 'mockClientSecret'
        case 'entra.redirectUrl':
          return 'mockRedirectUrl'
        case 'entra.refreshTokens':
          return true
        case 'server.session.cookie.password':
          return 'mockPassword'
        case 'server.session.cookie.secure':
          return true
        default:
          return 'defaultConfigValue'
      }
    })
  })

  describe('registerClientSecretStrategy', () => {
    let server

    beforeEach(() => {
      server = {
        auth: {
          strategy: vi.fn(),
          default: vi.fn()
        }
      }
    })

    test('should be a function', () => {
      expect(registerClientSecretStrategy).toBeInstanceOf(Function)
    })

    test('should register entra strategy', async () => {
      await registerClientSecretStrategy(server)

      expect(server.auth.strategy).toHaveBeenCalledWith(
        'entra',
        'bell',
        expect.any(Object)
      )
    })

    test('should register session strategy', async () => {
      await registerClientSecretStrategy(server)

      expect(server.auth.strategy).toHaveBeenCalledWith(
        'session',
        'cookie',
        expect.any(Object)
      )
    })

    test('should set default strategy to session', async () => {
      await registerClientSecretStrategy(server)

      expect(server.auth.default).toHaveBeenCalledWith('session')
    })
  })

  describe('getBellOptions', () => {
    test('should return an object', () => {
      expect(getBellOptions(mockOidcConfig)).toBeInstanceOf(Object)
    })

    test('should set client id from config', () => {
      expect(getBellOptions(mockOidcConfig).clientId).toBe('mockClientId')
    })

    test('should set client secret from config', () => {
      expect(getBellOptions(mockOidcConfig).clientSecret).toBe('mockClientSecret')
    })

    test('should set cookie password from config', () => {
      expect(getBellOptions(mockOidcConfig).password).toBe('mockPassword')
    })

    test('should set isSecure from config', () => {
      expect(getBellOptions(mockOidcConfig).isSecure).toBe(true)
    })

    test('should have a location function', () => {
      expect(getBellOptions(mockOidcConfig).location).toBeInstanceOf(Function)
    })

    test('should have a providerParams function', () => {
      expect(getBellOptions(mockOidcConfig).providerParams).toBeInstanceOf(Function)
    })

    describe('location', () => {
      const location = getBellOptions(mockOidcConfig).location
      let request

      beforeEach(() => {
        vi.clearAllMocks()
        mockGetSafeRedirect.mockReturnValue('/search-sbi')
        request = {
          query: {},
          yar: {
            set: vi.fn()
          }
        }
      })

      test('should return redirectUrl from config', () => {
        expect(location(request)).toBe('mockRedirectUrl')
      })

      test('should check redirect link is safe if redirect query param is present', () => {
        request.query.redirect = '/redirect'
        location(request)
        expect(mockGetSafeRedirect).toHaveBeenCalledWith('/redirect')
      })

      test('should set safe redirect path in session if redirect query param is present', () => {
        request.query.redirect = '/redirect'
        location(request)
        expect(request.yar.set).toHaveBeenCalledWith('redirect', '/search-sbi')
      })
    })

    describe('providerParams', () => {
      const providerParams = getBellOptions(mockOidcConfig).providerParams
      let request

      beforeEach(() => {
        request = { query: {} }
      })

      test('should return an object', () => {
        expect(providerParams(request)).toBeInstanceOf(Object)
      })

      test('should include response_mode as query', () => {
        expect(providerParams(request).response_mode).toBe('query')
      })
    })

    describe('provider', () => {
      test('should be an object', () => {
        expect(getBellOptions(mockOidcConfig).provider).toBeInstanceOf(Object)
      })

      test('should be named "entra"', () => {
        expect(getBellOptions(mockOidcConfig).provider.name).toBe('entra')
      })

      test('should use oauth2 protocol', () => {
        expect(getBellOptions(mockOidcConfig).provider.protocol).toBe('oauth2')
      })

      test('should use params auth', () => {
        expect(getBellOptions(mockOidcConfig).provider.useParamsAuth).toBe(true)
      })

      test('should use authorization endpoint from oidc config', () => {
        expect(getBellOptions(mockOidcConfig).provider.auth).toBe(mockOidcConfig.authorization_endpoint)
      })

      test('should use token endpoint from oidc config', () => {
        expect(getBellOptions(mockOidcConfig).provider.token).toBe(mockOidcConfig.token_endpoint)
      })

      test('should create a scope array', () => {
        expect(getBellOptions(mockOidcConfig).provider.scope).toEqual(['mockClientId/.default', 'offline_access'])
      })

      test('should have a profile function', () => {
        expect(getBellOptions(mockOidcConfig).provider.profile).toBeInstanceOf(Function)
      })

      describe('profile', () => {
        const profile = getBellOptions(mockOidcConfig).provider.profile

        let credentials
        let encodedToken

        beforeEach(() => {
          vi.clearAllMocks()
          encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
          credentials = { token: encodedToken }
        })

        test('should decode token provide from Entra', () => {
          profile(credentials)
          expect(jwtDecodeSpy).toHaveBeenCalledWith(credentials.token)
        })

        test('should throw error if token is not provided', () => {
          credentials.token = null
          expect(() => profile(credentials)).toThrow()
        })

        test('should throw error if Jwt library throws error', () => {
          jwtDecodeSpy.mockImplementationOnce(() => {
            throw new Error('Test error')
          })
          expect(() => profile(credentials)).toThrow('Test error')
        })

        test('should populate credentials profile with decoded token payload', () => {
          profile(credentials)
          expect(credentials.profile).toMatchObject({ ...token })
        })

        test('should add sessionId property to credentials profile', () => {
          profile(credentials)
          expect(credentials.profile.sessionId).toBe(token.sid)
        })
      })
    })
  })

  describe('validateToken', () => {
    let request
    let session
    let userSession
    let encodedToken

    beforeEach(() => {
      vi.clearAllMocks()
      mockConfigGet.mockImplementation((key) => {
        switch (key) {
          case 'entra.refreshTokens':
            return true
          default:
            return 'defaultConfigValue'
        }
      })

      encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
      userSession = {
        token: encodedToken,
        refreshToken: 'refresh-token-123'
      }

      session = {
        sessionId: 'session-id-123'
      }

      request = {
        server: {
          app: {
            cache: {
              get: vi.fn().mockResolvedValue(userSession),
              set: vi.fn().mockResolvedValue(undefined)
            }
          },
          logger: {
            info: vi.fn()
          }
        }
      }
    })

    test('should be a function', () => {
      expect(validateToken).toBeInstanceOf(Function)
    })

    describe('when session does not exist in cache', () => {
      beforeEach(() => {
        request.server.app.cache.get.mockResolvedValue(null)
      })

      test('should return invalid session', async () => {
        const result = await validateToken(request, session)
        expect(result).toEqual({ isValid: false })
      })

      test('should fetch session from cache', async () => {
        await validateToken(request, session)
        expect(request.server.app.cache.get).toHaveBeenCalledWith(session.sessionId)
      })
    })

    describe('when session exists and token is valid', () => {
      beforeEach(() => {
        jwtVerifyTimeSpy.mockImplementation(() => {})
      })

      test('should return valid session with credentials', async () => {
        const result = await validateToken(request, session)
        expect(result).toEqual({ isValid: true, credentials: userSession })
      })

      test('should decode the token', async () => {
        await validateToken(request, session)
        expect(jwtDecodeSpy).toHaveBeenCalledWith(userSession.token)
      })

      test('should verify token time', async () => {
        await validateToken(request, session)
        expect(jwtVerifyTimeSpy).toHaveBeenCalled()
      })

      test('should not refresh tokens', async () => {
        await validateToken(request, session)
        expect(mockRefreshTokens).not.toHaveBeenCalled()
      })
    })

    describe('when token verification fails and refresh tokens is disabled', () => {
      beforeEach(() => {
        mockConfigGet.mockImplementation((key) => {
          if (key === 'entra.refreshTokens') return false
          return 'defaultConfigValue'
        })
        jwtVerifyTimeSpy.mockImplementation(() => {
          throw new Error('Token expired')
        })
      })

      test('should log the error', async () => {
        await validateToken(request, session)
        expect(request.server.logger.info).toHaveBeenCalledWith('Token expired')
      })

      test('should return invalid session', async () => {
        const result = await validateToken(request, session)
        expect(result).toEqual({ isValid: false })
      })

      test('should not attempt to refresh tokens', async () => {
        await validateToken(request, session)
        expect(mockRefreshTokens).not.toHaveBeenCalled()
      })
    })

    describe('when token verification fails and refresh tokens is enabled', () => {
      const newToken = 'new-access-token'
      const newRefreshToken = 'new-refresh-token'

      beforeEach(() => {
        mockConfigGet.mockImplementation((key) => {
          if (key === 'entra.refreshTokens') return true
          return 'defaultConfigValue'
        })
        jwtVerifyTimeSpy.mockImplementation(() => {
          throw new Error('Token expired')
        })
        mockRefreshTokens.mockResolvedValue({
          access_token: newToken,
          refresh_token: newRefreshToken
        })
      })

      test('should call refreshTokens with refresh token', async () => {
        await validateToken(request, session)
        expect(mockRefreshTokens).toHaveBeenCalledWith('refresh-token-123')
      })

      test('should update session token', async () => {
        await validateToken(request, session)
        expect(userSession.token).toBe(newToken)
      })

      test('should update session refresh token', async () => {
        await validateToken(request, session)
        expect(userSession.refreshToken).toBe(newRefreshToken)
      })

      test('should persist updated session to cache', async () => {
        await validateToken(request, session)
        expect(request.server.app.cache.set).toHaveBeenCalledWith(
          session.sessionId,
          expect.objectContaining({
            token: newToken,
            refreshToken: newRefreshToken
          })
        )
      })

      test('should return valid session with updated credentials', async () => {
        const result = await validateToken(request, session)
        expect(result).toEqual({ isValid: true, credentials: userSession })
      })
    })
  })
})
