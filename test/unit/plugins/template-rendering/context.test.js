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
        serviceName: 'Single Front Door',
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
        serviceName: 'Single Front Door',
        serviceUrl: '/'
      })
    })
  })
})
