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
          return 'mockPassword-at-least-32-characters-long!!!!!!'
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
      expect(getCookieOptions(mockValidateToken).cookie.password).toBe(
        'mockPassword-at-least-32-characters-long!!!!!!'
      )
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

    test('should include encoded redirect param in redirection to intended path', () => {
      expect(redirectTo(request)).toContain('redirect=%2Fsearch-sbi%3Fquery%3Dstring')
    })

    test('should properly encode redirect URL with multiple query parameters', () => {
      const requestWithMultipleParams = {
        url: {
          pathname: '/search-sbi',
          search: '?sbi=123&crn=456'
        }
      }
      const result = redirectTo(requestWithMultipleParams)
      // Verify the entire URL is encoded as a single value, preventing parameter injection
      expect(result).toBe('/auth/sign-in?redirect=%2Fsearch-sbi%3Fsbi%3D123%26crn%3D456')
    })
  })

  describe('validate', () => {
    test('should call validateToken function', async () => {
      const validateTokenFn = vi.fn()
      const validate = getCookieOptions(validateTokenFn).validate
      const mockRequest = {}
      const mockSession = {}

      await validate(mockRequest, mockSession)

      expect(validateTokenFn).toHaveBeenCalledWith(mockRequest, mockSession)
    })
  })
})
