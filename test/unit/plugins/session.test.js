import { vi, beforeEach, describe, test, expect } from 'vitest'
import Yar from '@hapi/yar'

const mockConfigGet = vi.fn()
vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

let session

describe('session', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'server.session.cache.name':
          return 'mockCacheName'
        case 'server.session.cache.segment':
          return 'mockCacheSegment'
        case 'server.session.cookie.password':
          return 'mockCookiePassword'
        case 'server.isDevelopment':
          return true
        default:
          return 'defaultConfigValue'
      }
    })
    session = await import('../../../src/plugins/session.js')
  })

  test('should return an object', () => {
    expect(session.session).toBeInstanceOf(Object)
  })

  test('should register the Yar plugin', () => {
    expect(session.session.plugin).toBe(Yar)
  })

  test('should no create cookie if no data is set', () => {
    expect(session.session.options.storeBlank).toBe(false)
  })

  test('should always store data server side', () => {
    expect(session.session.options.maxCookieSize).toBe(0)
  })

  test('should set cache name from config', () => {
    expect(session.session.options.cache.cache).toBe('mockCacheName')
  })

  test('should set cache segment from config suffixed with -temp', () => {
    expect(session.session.options.cache.segment).toBe('mockCacheSegment-temp')
  })

  test('should set cookie password from config', () => {
    expect(session.session.options.cookieOptions.password).toBe('mockCookiePassword')
  })

  test('should set insecure cookie if in development', () => {
    expect(session.session.options.cookieOptions.isSecure).toBe(false)
  })

  test('should set secure cookie if not in development', async () => {
    vi.resetModules()
    mockConfigGet.mockReturnValue(false)
    session = await import('../../../src/plugins/session.js')
    expect(session.session.options.cookieOptions.isSecure).toBe(true)
  })

  test('should set SameSite cookie to Lax', () => {
    expect(session.session.options.cookieOptions.isSameSite).toBe('Lax')
  })
})
