import { vi, beforeEach, describe, test, expect } from 'vitest'
import { generateKeyPairSync } from 'crypto'
import { mockOidcConfig } from '../../mocks/setup-server-mocks.js'
import Jwt from '@hapi/jwt'

const jwtDecodeSpy = vi.spyOn(Jwt.token, 'decode')
const jwtVerifyTimeSpy = vi.spyOn(Jwt.token, 'verifyTime')

const mockConfigGet = vi.fn()
vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const mockGetSafeRedirect = vi.fn()
vi.mock('../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: mockGetSafeRedirect
}))

const mockRefreshTokens = vi.fn()
vi.mock('../../../src/auth/refresh-tokens.js', () => ({
  refreshTokens: mockRefreshTokens
}))

const mockGetSbiFromRelationships = vi.fn()
vi.mock('../../../src/auth/get-sbi-from-relationships.js', () => ({
  getSbiFromRelationships: mockGetSbiFromRelationships
}))

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

const refreshToken = 'ENTRA-ID-REFRESH-TOKEN'

const { auth, getBellOptions, getCookieOptions } = await import('../../../src/plugins/auth.js')

describe('auth', () => {
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

  test('should return an object', () => {
    expect(auth).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(auth.plugin.name).toBe('auth')
  })

  test('should have a register function', () => {
    expect(auth.plugin.register).toBeInstanceOf(Function)
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
        mockGetSafeRedirect.mockReturnValue('/home')
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
        expect(request.yar.set).toHaveBeenCalledWith('redirect', '/home')
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

  describe('getCookieOptions', () => {
    test('should return an object', () => {
      expect(getCookieOptions()).toBeInstanceOf(Object)
    })

    test('should return a cookie object', () => {
      expect(getCookieOptions().cookie).toBeInstanceOf(Object)
    })

    test('should return a redirectTo function', () => {
      expect(getCookieOptions().redirectTo).toBeInstanceOf(Function)
    })

    test('should return a validate function', () => {
      expect(getCookieOptions().validate).toBeInstanceOf(Function)
    })

    describe('cookie', () => {
      test('should set cookie password from config', () => {
        expect(getCookieOptions().cookie.password).toBe('mockPassword')
      })

      test('should set cookie path to root', () => {
        expect(getCookieOptions().cookie.path).toBe('/')
      })

      test('should set isSecure from config', () => {
        expect(getCookieOptions().cookie.isSecure).toBe(true)
      })

      test('should set isSameSite to Lax', () => {
        expect(getCookieOptions().cookie.isSameSite).toBe('Lax')
      })
    })

    describe('redirectTo', () => {
      const redirectTo = getCookieOptions().redirectTo
      const request = {
        url: {
          pathname: '/home',
          search: '?query=string'
        }
      }

      test('should redirect to sign-in route', () => {
        expect(redirectTo(request).startsWith('/auth/sign-in')).toBe(true)
      })

      test('should include redirect param in redirection to intended path', () => {
        expect(redirectTo(request)).toContain('redirect=/home?query=string')
      })
    })

    describe('validate', () => {
      const validate = getCookieOptions().validate
      const mockCacheGet = vi.fn()
      const mockCacheSet = vi.fn()
      const request = {
        server: {
          app: {
            cache: {
              get: mockCacheGet,
              set: mockCacheSet
            }
          }
        }
      }
      const session = {
        sessionId: 'session-id',
        refreshToken
      }

      let userSession

      beforeEach(() => {
        vi.clearAllMocks()
        const encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
        session.token = encodedToken

        userSession = {
          token: encodedToken,
          refreshToken
        }

        mockRefreshTokens.mockResolvedValue({
          access_token: encodedToken,
          refresh_token: refreshToken
        })

        mockCacheGet.mockResolvedValue(userSession)
      })

      test('should return an object', async () => {
        const result = await validate(request, session)
        expect(result).toBeInstanceOf(Object)
      })

      test('should get session from cache', async () => {
        await validate(request, session)
        expect(mockCacheGet).toHaveBeenCalledWith(session.sessionId)
      })

      test('should decode token from session', async () => {
        await validate(request, session)
        expect(jwtDecodeSpy).toHaveBeenCalledWith(session.token)
      })

      test('should verify token time', async () => {
        await validate(request, session)
        expect(jwtVerifyTimeSpy).toHaveBeenCalled()
      })

      test('should return valid state if session exists and token is valid', async () => {
        const result = await validate(request, session)
        expect(result.isValid).toBe(true)
      })

      test('should add credentials as session data to request if session exists and token is valid', async () => {
        const result = await validate(request, session)
        expect(result.credentials).toEqual(userSession)
      })

      test('should return invalid state if session does not exist', async () => {
        mockCacheGet.mockResolvedValue(null)
        const result = await validate(request, session)
        expect(result.isValid).toBe(false)
      })

      test('should return invalid state if token has expired and refresh tokens are disabled', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        mockConfigGet.mockReturnValueOnce(false)
        const result = await validate(request, session)
        expect(result.isValid).toBe(false)
      })

      test('should refresh tokens if token is has expired and refresh tokens are enabled', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        await validate(request, session)
        expect(mockRefreshTokens).toHaveBeenCalledWith(refreshToken)
      })

      test('should overwrite session data in cache if tokens are refreshed', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        await validate(request, session)
        expect(mockCacheSet).toHaveBeenCalledWith(session.sessionId, userSession)
      })

      test('should return valid state if tokens are refreshed', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        const result = await validate(request, session)
        expect(result.isValid).toBe(true)
      })
    })
  })
})
