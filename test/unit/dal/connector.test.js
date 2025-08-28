import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { dalConnector } from '../../../src/dal/connector.js'
import { exampleQuery } from '../../../src/dal/queries/example-query.js'

vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'dalConfig.email') return 'mock-test-user@defra.gov.uk'
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

vi.mock('../../../src/server.js', () => ({
  getTokenCache: vi.fn().mockReturnValue('mocked-cache')
}))

describe('DAL (data access layer) connector', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('should handle GraphQL errors', async () => {
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

    const result = await dalConnector(exampleQuery, { sbi: 123456789 })

    expect(result.data).toBeNull()
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toBe('SBI not found')
    expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
    expect(result.statusCode).toBe(404)
  })

  test('should handle successful response from DAL without errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          business: {
            sbi: 123456789,
            name: 'Test Business'
          }
        },
        errors: null
      })
    })

    const result = await dalConnector(exampleQuery, { sbi: 123456789 })

    expect(result.data).toBeDefined()
    expect(result.data.business.name).toBe('Test Business')
    expect(result.errors).toBeNull()
    expect(result.statusCode).toBe(200)
  })

  test('should not throw error when email param is excluded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          business: {
            sbi: 123456789,
            name: 'Test Business'
          }
        },
        errors: null
      })
    })

    const result = await dalConnector(exampleQuery, { sbi: 123456789 })

    expect(result.data).toBeDefined()
    expect(result.data.business.name).toBe('Test Business')
    expect(result.errors).toBeNull()
    expect(result.statusCode).toBe(200)
  })

  test('should handle network errors in catch block', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await dalConnector(exampleQuery, { sbi: 123456789 })

    expect(result.data).toBeNull()
    expect(result.statusCode).toBe(500)
    expect(result.errors[0].message).toBe('Network error')
  })
})
