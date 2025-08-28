import { vi, beforeEach, describe, test, expect } from 'vitest'
import { constants as httpConstants } from 'node:http2'

let staticAssetRoutes
let config

const mockResponse = {
  code: vi.fn().mockReturnThis(),
  type: vi.fn().mockReturnThis()
}

const mockH = {
  response: vi.fn().mockReturnValue(mockResponse)
}

describe('Static asset routes', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    vi.doMock('../../../src/config/index.js', () => ({
      config: {
        get: vi.fn(key => {
          if (key === 'server.staticCacheTimeout') return 3600000
          if (key === 'server.assetPath') return '/public'
          return null
        })
      }
    }))

    const { staticAssetRoutes: routes } = await import('../../../src/routes/static-assets-routes.js')
    const { config: configModule } = await import('../../../src/config/index.js')

    staticAssetRoutes = routes
    config = configModule
  })

  test('there should be two static asset routes', () => {
    expect(staticAssetRoutes).toHaveLength(2)
  })

  describe('favicon route', () => {
    test('should have the correct method and path', () => {
      const faviconRoute = staticAssetRoutes[0]
      expect(faviconRoute.method).toBe('GET')
      expect(faviconRoute.path).toBe('/favicon.ico')
    })

    test('should have correct cache settings', () => {
      const faviconRoute = staticAssetRoutes[0]
      expect(faviconRoute.options.cache.expiresIn).toBe(3600000)
      expect(faviconRoute.options.cache.privacy).toBe('private')
      expect(config.get).toHaveBeenCalledWith('server.staticCacheTimeout')
    })

    test('should have auth disabled', () => {
      const faviconRoute = staticAssetRoutes[0]
      expect(faviconRoute.options.auth).toBe(false)
    })

    test('should return no content response with correct mime type', () => {
      const faviconRoute = staticAssetRoutes[0]
      const result = faviconRoute.handler(null, mockH)

      expect(mockH.response).toHaveBeenCalled()
      expect(mockResponse.code).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_NO_CONTENT)
      expect(mockResponse.type).toHaveBeenCalledWith('image/x-icon')
      expect(result).toBe(mockResponse)
    })
  })

  describe('assets directory route', () => {
    test('should have the correct method and path', () => {
      const assetsRoute = staticAssetRoutes[1]
      expect(assetsRoute.method).toBe('GET')
      expect(assetsRoute.path).toBe('/public/{param*}')
      expect(config.get).toHaveBeenCalledWith('server.assetPath')
    })

    test('should have correct cache settings', () => {
      const assetsRoute = staticAssetRoutes[1]
      expect(assetsRoute.options.cache.expiresIn).toBe(3600000)
      expect(assetsRoute.options.cache.privacy).toBe('private')
    })

    test('should have auth disabled', () => {
      const assetsRoute = staticAssetRoutes[1]
      expect(assetsRoute.options.auth).toBe(false)
    })

    test('should use directory handler with correct config', () => {
      const assetsRoute = staticAssetRoutes[1]
      expect(assetsRoute.handler).toEqual({
        directory: {
          path: '.',
          redirectToSlash: true
        }
      })
    })
  })
})
