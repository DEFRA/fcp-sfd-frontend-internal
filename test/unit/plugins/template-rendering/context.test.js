import { vi, beforeEach, describe, test, expect } from 'vitest'
import fs from 'node:fs'
import { context } from '../../../../src/plugins/template-renderer/context.js'

vi.mock('../../../../src/config/navigation-items.js', () => ({
  getNavigationItems: () => [{
    isActive: true,
    text: 'Home',
    url: '/'
  }]
}))

vi.mock('../../../../src/utils/logger.js', () => ({
  createLogger: () => ({
    error: vi.fn()
  })
}))

const mockReadFileSync = vi.spyOn(fs, 'readFileSync').mockImplementation(() => '{}')
const mockLoggerError = vi.fn()
const mockCacheGet = vi.fn()
vi.spyOn(console, 'error').mockImplementation(mockLoggerError)

vi.mock('../../../../src/plugins/template-renderer/context.js', async (importOriginal) => {
  const originalModule = await importOriginal()

  return {
    ...originalModule,
    context: (request) => {
      const result = originalModule.context(request)
      const originalGetAssetPath = result.getAssetPath
      result.getAssetPath = (asset) => {
        if (asset === 'application.js') {
          return '/public/javascripts/application.js'
        }
        return originalGetAssetPath(asset)
      }
      return result
    }
  }
})

describe('#context', () => {
  const mockRequest = {
    path: '/',
    response: {
      source: {
        context: {
          existingKey: 'value'
        }
      }
    }
  }
  let contextResult

  describe('When webpack manifest file read succeeds', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
      mockReadFileSync.mockReturnValue(`{
        "application.js": "javascripts/application.js",
        "stylesheets/application.scss": "stylesheets/application.css"
      }`)
      contextResult = await context(mockRequest)
    })

    test('Should provide expected context', () => {
      expect(contextResult).toEqual({
        existingKey: 'value',
        assetPath: '/public/assets',
        auth: null,
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })

    describe('With valid asset path for Production', () => {
      test('Should provide expected asset path', () => {
        expect(contextResult.getAssetPath('application.js')).toMatch(
          /^\/public\/javascripts\/application(\.[\w\d]+)?\.?m?i?n?\.?js$/
        )
      })
    })

    describe('With invalid asset path', () => {
      test('Should provide expected asset', () => {
        expect(contextResult.getAssetPath('an-image.png')).toBe(
          '/public/an-image.png'
        )
      })
    })
  })
})

describe('#context cache', () => {
  const mockRequest = {
    path: '/',
    response: {
      source: {
        context: {
          existingKey: 'value'
        }
      }
    }
  }
  let firstContextResult
  let secondContextResult

  describe('Webpack manifest file cache', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
      mockReadFileSync.mockReturnValue(`{
        "application.js": "javascripts/application.js",
        "stylesheets/application.scss": "stylesheets/application.css"
      }`)
      firstContextResult = await context(mockRequest)
      mockReadFileSync.mockClear()
      secondContextResult = await context(mockRequest)
    })

    test('Should read file on first call', () => {
      expect(firstContextResult).toBeDefined()
      expect(mockReadFileSync).toHaveBeenCalledTimes(0)
    })

    test('Should use cache on second call', () => {
      expect(secondContextResult).toBeDefined()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    test('Should provide expected context', () => {
      expect(secondContextResult).toEqual({
        existingKey: 'value',
        assetPath: '/public/assets',
        auth: null,
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })
  })
  describe('session cache', () => {
    const session = {
      name: 'A Farmer',
      isAuthenticated: true,
      scope: ['user']
    }

    let request

    beforeEach(() => {
      request = {

        server: {
          app: {
            cache: {
              get: mockCacheGet
            }
          }
        },
        response: {
          source: {
            context: {}
          }
        },
        auth: {
          isAuthenticated: true,
          credentials: {
            sessionId: 'sessionId'
          }
        }
      }

      mockCacheGet.mockResolvedValue(session)
    })

    test('return value should contain request.response.source.context', async () => {
      request.response.source.context = { existingContext: 'request context value' }
      const result = await context(request)
      expect(result).toEqual({
        existingContext: 'request context value',
        assetPath: '/public/assets',
        auth: {
          name: 'A Farmer',
          isAuthenticated: true,
          scope: ['user']
        },
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })

    test('return value should contain no request.response.source.context when request.response.source is null', async () => {
      request.response.source = null
      const result = await context(request)
      expect(result).toEqual({
        assetPath: '/public/assets',
        auth: {
          name: 'A Farmer',
          isAuthenticated: true,
          scope: ['user']
        },
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })

    test('should return property auth equal null if not authenticated', async () => {
      request.auth.isAuthenticated = false
      const result = await context(request)
      expect(result).toEqual({
        assetPath: '/public/assets',
        auth: null,
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })

    test('should return property auth equal session data if authenticated', async () => {
      const result = await context(request)
      expect(result).toEqual({
        assetPath: '/public/assets',
        auth: {
          name: 'A Farmer',
          isAuthenticated: true,
          scope: ['user']
        },
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          }
        ],
        serviceName: 'Land and farm service',
        serviceUrl: '/'
      })
    })
  })
})
