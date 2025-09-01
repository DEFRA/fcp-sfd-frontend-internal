import { vi, describe, beforeEach, afterEach, test, expect, afterAll, beforeAll } from 'vitest'

const mockLoggerInfo = vi.fn()
const mockLoggerError = vi.fn()

const mockRedisOn = vi.fn().mockReturnThis()
const mockRedisQuit = vi.fn().mockResolvedValue()

const mockRedisInstance = {
  on: mockRedisOn,
  quit: mockRedisQuit
}

const Redis = vi.fn().mockReturnValue(mockRedisInstance)

Redis.Cluster = vi.fn().mockReturnValue(mockRedisInstance)

vi.mock('../../../../src/utils/logger.js', () => ({
  createLogger: () => ({
    info: mockLoggerInfo,
    error: mockLoggerError,
    flush: vi.fn().mockResolvedValue()
  })
}))

vi.mock('ioredis', () => ({
  default: Redis
}))

const mockCatboxRedisInstance = { start: vi.fn(), stop: vi.fn() }
const mockCatboxMemoryInstance = { start: vi.fn(), stop: vi.fn() }

vi.mock('@hapi/catbox-redis', () => ({
  Engine: vi.fn().mockImplementation(() => mockCatboxRedisInstance)
}))

vi.mock('@hapi/catbox-memory', () => ({
  Engine: vi.fn().mockImplementation(() => mockCatboxMemoryInstance)
}))

vi.mock('../../../../src/utils/caching/redis-client.js', () => ({
  buildRedisClient: vi.fn().mockReturnValue(mockRedisInstance)
}))

let originalConfigGet

vi.mock('../../../../src/config/index.js', () => {
  const mockConfig = {
    get: vi.fn(key => {
      if (key === 'redis') return { host: 'localhost', port: 6379 }
      if (key === 'server.isProduction') return false
      return null
    }),
    set: vi.fn()
  }

  originalConfigGet = mockConfig.get

  return { config: mockConfig }
})

let getCacheEngine, config

const setup = async () => {
  const cacheEngineModule = await import('../../../../src/utils/caching/cache-engine.js')
  const configModule = await import('../../../../src/config/index.js')

  getCacheEngine = cacheEngineModule.getCacheEngine
  config = configModule.config
}

beforeAll(async () => {
  await setup()
})

describe('#getCacheEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('When Redis cache engine has been requested', () => {
    test('Should return a Redis cache instance', () => {
      const result = getCacheEngine('redis')
      expect(mockLoggerInfo).toHaveBeenCalledWith('Using Redis session cache')
      expect(result).toBe(mockCatboxRedisInstance)
    })
  })

  describe('When In memory cache engine has been requested', () => {
    test('Should return a Memory cache instance', () => {
      const result = getCacheEngine()
      expect(mockLoggerInfo).toHaveBeenCalledWith('Using Catbox Memory session cache')
      expect(result).toBe(mockCatboxMemoryInstance)
    })
  })

  describe('When In memory cache engine has been requested in Production', () => {
    beforeEach(() => {
      config.get = vi.fn(key => {
        if (key === 'server.isProduction') return true
        if (key === 'redis') return { host: 'localhost', port: 6379 }
        return null
      })
    })

    afterEach(() => {
      config.get = originalConfigGet
    })

    test('Should return a Memory cache instance and log a warning', () => {
      const result = getCacheEngine()
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Catbox Memory is for local development only, it should not be used in production!'
      )
      expect(mockLoggerInfo).toHaveBeenCalledWith('Using Catbox Memory session cache')
      expect(result).toBe(mockCatboxMemoryInstance)
    })
  })
})
