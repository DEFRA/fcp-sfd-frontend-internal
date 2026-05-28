// Test framework dependencies
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

// Thing under test
import { initDalConnector, getDalConnector } from '../../../src/dal/connector.js'

// Test helpers
import { exampleQuery } from '../../../src/dal/queries/example-query.js'

vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'dalConfig.endpoint') return 'http://test-dal-endpoint/graphql'
      return null
    })
  }
}))

vi.mock('../../../src/utils/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn()
  })
}))

vi.mock('../../../src/services/DAL/token/get-token-service.js', () => ({
  getTokenService: vi.fn().mockResolvedValue('mocked-token')
}))

describe('DAL (data access layer) connector', () => {
  const originalFetch = global.fetch

  let mockTokenCache
  let dalConnector

  beforeEach(() => {
    vi.clearAllMocks()

    mockTokenCache = {}
    initDalConnector(mockTokenCache)
    dalConnector = getDalConnector()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const defaultSuccessData = { business: { sbi: 123456789, name: 'Test Business' } }
  const mockSuccessfulDalResponse = (data = defaultSuccessData) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data, errors: null })
    })
  }

  describe('when the DAL returns a successful response', () => {
    test('should return data and status without errors', async () => {
      mockSuccessfulDalResponse()

      const result = await dalConnector.query(exampleQuery, { sbi: 123456789 })

      expect(result.data).toBeDefined()
      expect(result.data.business.name).toBe('Test Business')
      expect(result.errors).toBeNull()
      expect(result.statusCode).toBe(200)
    })
  })

  describe('when the DAL returns a GraphQL error', () => {
    test('should return a formatted error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          data: null,
          errors: [
            {
              message: 'SBI not found',
              extensions: {
                code: 'NOT_FOUND',
                response: {
                  status: 404
                }
              }
            }
          ]
        })
      })

      const result = await dalConnector.query(exampleQuery, { sbi: 123456789 })

      expect(result.data).toBeNull()
      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toBe('SBI not found')
      expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
      expect(result.statusCode).toBe(404)
    })
  })

  describe('when a network error occurs', () => {
    test('returns a formatted error response', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await dalConnector.query(exampleQuery, { sbi: 123456789 })

      expect(result.data).toBeNull()
      expect(result.statusCode).toBe(500)
      expect(result.errors[0].message).toBe('Network error')
    })
  })

  describe('when the connector is requested before it has been initialised', () => {
    test('should throw DAL connector not initialised error', async () => {
      vi.resetModules()
      const { getDalConnector } = await import('../../../src/dal/connector.js')

      expect(() => getDalConnector()).toThrowError(
        'DAL connector not initialised. Call initDalConnector during server startup first.'
      )
    })
  })

  describe('when the connector is initialised without token cache', () => {
    test('should throw DAL connector token cache not initialised error', async () => {
      vi.resetModules()
      const { initDalConnector } = await import('../../../src/dal/connector.js')

      expect(() => initDalConnector()).toThrowError(
        'DAL connector token cache not initialised.'
      )
    })
  })
})
