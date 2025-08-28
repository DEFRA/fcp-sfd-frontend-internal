import { vi, describe, test, expect, beforeEach } from 'vitest'
import { config } from '../../../src/config/index.js'

let mockLogger, provideProxy, proxyFetch

vi.mock('../../../src/utils/logger.js', () => {
  mockLogger = {
    debug: vi.fn()
  }

  return {
    createLogger: () => mockLogger
  }
})

vi.mock('undici', () => {
  class MockProxyAgent {
    constructor (options) {
      this.options = options
    }
  }

  return {
    ProxyAgent: MockProxyAgent
  }
})

vi.mock('https-proxy-agent', () => {
  const mockHttpsProxyAgent = vi.fn().mockImplementation((url) => {
    return { url }
  })

  return {
    HttpsProxyAgent: mockHttpsProxyAgent
  }
})

global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })))

const httpProxyUrl = 'http://proxy.example.com'
const httpsProxyUrl = 'https://proxy.example.com'
const httpPort = 80
const httpsPort = 443
const testUrl = 'https://example.com/api'
const testOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } }

describe('#proxy', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    config.set('server.httpProxy', null)
    config.set('server.httpsProxy', null)

    const proxyModule = await import('../../../src/utils/proxy.js')
    provideProxy = proxyModule.provideProxy
    proxyFetch = proxyModule.proxyFetch
  })

  describe('#provideProxy', () => {
    describe('when a Proxy URL has not been set', () => {
      test('should return null', () => {
        expect(provideProxy()).toBeNull()
      })

      test('should not log anything', () => {
        provideProxy()
        expect(mockLogger.debug).not.toHaveBeenCalled()
      })
    })

    describe('when a HTTP Proxy URL has been set', () => {
      let result

      beforeEach(() => {
        config.set('server.httpProxy', httpProxyUrl)
        result = provideProxy()
      })

      test('should set the correct port for HTTP', () => {
        expect(result).toHaveProperty('port', httpPort)
      })

      test('should create the correct URL object', () => {
        expect(result.url.origin).toBe(httpProxyUrl)
      })
    })

    describe('when a HTTPS Proxy URL has been set', () => {
      let result

      beforeEach(() => {
        config.set('server.httpsProxy', httpsProxyUrl)
        result = provideProxy()
      })

      test('should set the correct port for HTTPS', () => {
        expect(result).toHaveProperty('port', httpsPort)
      })
    })
  })

  describe('#proxyFetch', () => {
    describe('when no proxy is configured', () => {
      test('should call fetch without a dispatcher', async () => {
        await proxyFetch(testUrl, testOptions)
        expect(global.fetch).toHaveBeenCalledWith(testUrl, testOptions)
      })
    })

    describe('when a proxy is configured', () => {
      beforeEach(() => {
        config.set('server.httpProxy', httpProxyUrl)
      })

      test('should call fetch with the right URL and include a dispatcher', async () => {
        await proxyFetch(testUrl, testOptions)

        expect(global.fetch).toHaveBeenCalled()

        const fetchCall = global.fetch.mock.calls[0]
        const actualUrl = fetchCall[0]
        const actualOptions = fetchCall[1]

        expect(actualUrl).toBe(testUrl)

        expect(actualOptions.method).toBe(testOptions.method)
        expect(actualOptions.headers).toEqual(testOptions.headers)

        expect(actualOptions).toHaveProperty('dispatcher')

        expect(actualOptions.dispatcher).toBeTruthy()
      })
    })
  })
})
