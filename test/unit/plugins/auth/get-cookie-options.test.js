import { vi, beforeEach, describe, test, expect } from 'vitest'

const mockConfigGet = vi.fn()
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const { getCookieOptions } = await import('../../../../src/plugins/auth/get-cookie-options.js')

describe('getCookieOptions', () => {
  const mockValidateToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
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
    expect(getCookieOptions(mockValidateToken)).toBeInstanceOf(Object)
  })

  test('should return a cookie object', () => {
    expect(getCookieOptions(mockValidateToken).cookie).toBeInstanceOf(Object)
  })

  test('should return a redirectTo function', () => {
    expect(getCookieOptions(mockValidateToken).redirectTo).toBeInstanceOf(Function)
  })

  test('should return a validate function', () => {
    expect(getCookieOptions(mockValidateToken).validate).toBeInstanceOf(Function)
  })

  describe('cookie', () => {
    test('should set cookie password from config', () => {
      expect(getCookieOptions(mockValidateToken).cookie.password).toBe('mockPassword')
    })

    test('should set cookie path to root', () => {
      expect(getCookieOptions(mockValidateToken).cookie.path).toBe('/')
    })

    test('should set isSecure from config', () => {
      expect(getCookieOptions(mockValidateToken).cookie.isSecure).toBe(true)
    })

    test('should set isSameSite to Lax', () => {
      expect(getCookieOptions(mockValidateToken).cookie.isSameSite).toBe('Lax')
    })
  })

  describe('redirectTo', () => {
    const mockValidateTokenFn = vi.fn()
    const redirectTo = getCookieOptions(mockValidateTokenFn).redirectTo
    const request = {
      url: {
        pathname: '/search-sbi',
        search: '?query=string'
      }
    }

    test('should redirect to sign-in route', () => {
      expect(redirectTo(request).startsWith('/auth/sign-in')).toBe(true)
    })

    test('should include redirect param in redirection to intended path', () => {
      expect(redirectTo(request)).toContain('redirect=/search-sbi?query=string')
    })
  })

  describe('validate', () => {
    let validateTokenFn

    beforeEach(() => {
      validateTokenFn = vi.fn()
      mockConfigGet.mockImplementation((key) => {
        switch (key) {
          case 'server.session.cookie.password':
            return 'mockPassword'
          case 'server.session.cookie.secure':
            return true
          default:
            return 'defaultConfigValue'
        }
      })
    })

    test('should call the validateToken function passed as parameter', async () => {
      const validate = getCookieOptions(validateTokenFn).validate
      const request = { server: { app: { cache: {} } } }
      const session = { sessionId: 'test-id' }

      validateTokenFn.mockResolvedValue({ isValid: true, credentials: {} })
      await validate(request, session)

      expect(validateTokenFn).toHaveBeenCalledWith(request, session)
    })

    test('should return result from validateToken function', async () => {
      const validate = getCookieOptions(validateTokenFn).validate
      const request = { server: { app: { cache: {} } } }
      const session = { sessionId: 'test-id' }
      const expectedResult = { isValid: true, credentials: { user: 'test' } }

      validateTokenFn.mockResolvedValue(expectedResult)
      const result = await validate(request, session)

      expect(result).toEqual(expectedResult)
    })

    test('should pass through invalid validation result', async () => {
      const validate = getCookieOptions(validateTokenFn).validate
      const request = { server: { app: { cache: {} } } }
      const session = { sessionId: 'test-id' }

      validateTokenFn.mockResolvedValue({ isValid: false })
      const result = await validate(request, session)

      expect(result.isValid).toBe(false)
    })
  })
})
