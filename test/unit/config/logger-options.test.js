import { vi, beforeAll, beforeEach, describe, test, expect } from 'vitest'

const mockGetTraceId = vi.fn()

vi.mock('@defra/hapi-tracing', () => ({
  getTraceId: mockGetTraceId
}))

let loggerOptions

beforeAll(async () => {
  const loggerOptionsModule = await import('../../../src/config/logger-options.js')
  loggerOptions = loggerOptionsModule.loggerOptions
})

describe('logger-options', () => {
  beforeEach(() => {
    mockGetTraceId.mockReset()
  })

  test('mixin function adds trace ID when available', () => {
    mockGetTraceId.mockReturnValue('test-trace-id')

    const result = loggerOptions.mixin()

    expect(result).toEqual({
      trace: { id: 'test-trace-id' }
    })
  })

  test('mixin function returns empty object when no trace ID', () => {
    mockGetTraceId.mockReturnValue(null)

    const result = loggerOptions.mixin()

    expect(result).toEqual({})
  })

  describe('request serializer', () => {
    const buildRequest = (path, params) => ({
      method: 'get',
      path,
      params
    })

    test('masks crn in the url, keeping only the last 4 digits', () => {
      const request = buildRequest('/customer/1234567890/details', { crn: '1234567890' })

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890/details')
    })

    test('leaves url unchanged when there is no crn param', () => {
      const request = buildRequest('/health', {})

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/health')
    })

    test('leaves sbi unchanged in url since only crn is masked', () => {
      const request = buildRequest('/business/123456789/details', { sbi: '123456789' })

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/business/123456789/details')
    })

    test('leaves url unchanged when params is null', () => {
      const request = buildRequest('/health', null)

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/health')
    })

    test('masks crn from the url even when params is empty, matching hapi-pino\'s onRequest timing', () => {
      // hapi-pino builds the child logger binding on 'onRequest', before hapi has matched the
      // route, so request.params is always {} at that point in real traffic
      const request = buildRequest('/customer/1234567890/details', {})

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890/details')
    })

    test('masks crn from the url when params is null, matching hapi-pino\'s onRequest timing', () => {
      const request = buildRequest('/customer/1234567890/details', null)

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890/details')
    })

    test('masks crn in a path with no trailing segment', () => {
      const request = buildRequest('/customer/1234567890', {})

      const result = loggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890')
    })
  })

  describe('customRequestCompleteMessage', () => {
    test('masks crn and includes status code and response time', () => {
      const request = {
        method: 'get',
        path: '/customer/1234567890/details',
        params: { crn: '1234567890' },
        raw: { res: { headersSent: true, statusCode: 200 } }
      }

      const message = loggerOptions.customRequestCompleteMessage(request, 12)

      expect(message).toBe('[response] get /customer/******7890/details 200 (12ms)')
    })

    test('shows "-" as the status code when the response headers have not been sent', () => {
      const request = {
        method: 'get',
        path: '/health',
        params: {},
        raw: { res: { headersSent: false, statusCode: 200 } }
      }

      const message = loggerOptions.customRequestCompleteMessage(request, 5)

      expect(message).toBe('[response] get /health - (5ms)')
    })
  })

  describe('non-local (production) request serializer', () => {
    let nonLocalLoggerOptions

    beforeAll(async () => {
      vi.resetModules()
      vi.doMock('../../../src/config/index.js', () => ({
        config: {
          get: (key) => (key === 'server.isDevelopment' ? false : {})
        }
      }))

      const loggerOptionsModule = await import('../../../src/config/logger-options.js')
      nonLocalLoggerOptions = loggerOptionsModule.loggerOptions

      vi.doUnmock('../../../src/config/index.js')
    })

    test('includes masked params alongside the masked url', () => {
      const request = {
        method: 'get',
        path: '/customer/1234567890/details',
        params: { crn: '1234567890' }
      }

      const result = nonLocalLoggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890/details')
      expect(result.params.crn).toBe('******7890')
    })

    test('does not mutate the original params object', () => {
      const originalParams = { crn: '1234567890' }
      const request = { method: 'get', path: '/customer/1234567890/details', params: originalParams }

      nonLocalLoggerOptions.serializers.req(request)

      expect(originalParams.crn).toBe('1234567890')
    })

    test('returns params unchanged when there is no crn', () => {
      const request = { method: 'get', path: '/health', params: { sbi: '123456789' } }

      const result = nonLocalLoggerOptions.serializers.req(request)

      expect(result.params).toEqual({ sbi: '123456789' })
    })

    test('masks crn from the url even when params is empty, matching hapi-pino\'s onRequest timing', () => {
      const request = { method: 'get', path: '/customer/1234567890/details', params: {} }

      const result = nonLocalLoggerOptions.serializers.req(request)

      expect(result.url).toBe('/customer/******7890/details')
    })
  })
})
