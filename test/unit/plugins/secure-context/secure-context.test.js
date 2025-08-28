import { vi, beforeAll, beforeEach, describe, test, expect, afterAll, afterEach } from 'vitest'
import hapi from '@hapi/hapi'

import { secureContext } from '../../../../src/plugins/secure-context/secure-context.js'
import { config } from '../../../../src/config/index.js'

describe('secureContext plugin', () => {
  let server
  let originalConfigGet
  let originalProcessEnv
  const mockLoggerInfo = vi.fn()
  const mockLoggerError = vi.fn()

  beforeAll(() => {
    originalProcessEnv = process.env
    originalConfigGet = config.get
  })

  afterAll(() => {
    config.get = originalConfigGet
    process.env = originalProcessEnv
  })

  beforeEach(() => {
    vi.resetAllMocks()
    mockLoggerInfo.mockClear()
    mockLoggerError.mockClear()

    server = hapi.server()

    server.decorate('server', 'logger', {
      info: mockLoggerInfo,
      error: mockLoggerError
    })
  })

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('when secure context is disabled', () => {
    beforeEach(async () => {
      config.get = vi.fn((key) => {
        if (key === 'server.isSecureContextEnabled') {
          return false
        }
        return originalConfigGet ? originalConfigGet(key) : undefined
      })

      await server.register(secureContext)
    })

    test('should log that secure context is disabled', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith('Custom secure context is disabled')
    })

    test('should not add secureContext decorator', () => {
      expect(server.secureContext).toBeUndefined()
    })
  })

  describe('when secure context is enabled with certificates', () => {
    beforeEach(async () => {
      config.get = vi.fn((key) => {
        if (key === 'server.isSecureContextEnabled') {
          return true
        }
        return originalConfigGet ? originalConfigGet(key) : undefined
      })

      process.env = {
        ...originalProcessEnv,
        TRUSTSTORE_CERT1: 'cert1-content',
        TRUSTSTORE_CERT2: 'cert2-content'
      }

      await server.register(secureContext)
    })

    test('should decorate the server with secureContext', () => {
      expect(server.secureContext).toBeDefined()
    })

    test('server should have a secureContext object with a context property', () => {
      expect(server.secureContext).toHaveProperty('context')
    })
  })

  describe('when secure context is enabled without certificates', () => {
    beforeEach(async () => {
      config.get = vi.fn((key) => {
        if (key === 'server.isSecureContextEnabled') {
          return true
        }
        return originalConfigGet ? originalConfigGet(key) : undefined
      })

      process.env = { ...originalProcessEnv }
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('TRUSTSTORE_')) {
          delete process.env[key]
        }
      })

      await server.register(secureContext)
    })

    test('should log that no certificates were found', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith('Could not find any TRUSTSTORE_ certificates')
    })

    test('should still decorate the server with secureContext', () => {
      expect(server.secureContext).toBeDefined()
    })
  })
})
