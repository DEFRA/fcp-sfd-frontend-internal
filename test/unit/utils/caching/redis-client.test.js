import { vi, beforeEach, describe, test, expect } from 'vitest'
import { EventEmitter } from 'events'

const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
}

class MockRedis extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
  }
}

class MockCluster extends EventEmitter {
  constructor (nodes, options) {
    super()
    this.nodes = nodes
    this.options = options
  }
}

vi.mock('../../../../src/utils/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

vi.mock('ioredis', () => ({
  Redis: vi.fn((config) => new MockRedis(config)),
  Cluster: vi.fn((nodes, options) => new MockCluster(nodes, options))
}))

describe('buildRedisClient', () => {
  let buildRedisClient
  let Redis
  let Cluster
  let createLogger

  beforeEach(async () => {
    const redisModule = await import('ioredis')
    const loggerModule = await import('../../../../src/utils/logger.js')

    const module = await import('../../../../src/utils/caching/redis-client.js')

    buildRedisClient = module.buildRedisClient
    Redis = redisModule.Redis
    Cluster = redisModule.Cluster
    createLogger = loggerModule.createLogger

    vi.clearAllMocks()
  })

  test('creates a single Redis instance when useSingleInstanceCache is true', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: true,
      username: '',
      password: '',
      useTLS: false
    }

    const client = buildRedisClient(redisConfig)

    expect(Redis).toHaveBeenCalledWith({
      port: 6379,
      host: 'localhost',
      db: 0,
      keyPrefix: 'test:'
    })
    expect(Cluster).not.toHaveBeenCalled()
    expect(createLogger).toHaveBeenCalled()
    expect(client instanceof MockRedis).toBeTruthy()
  })

  test('creates a Cluster instance when useSingleInstanceCache is false', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: false,
      username: '',
      password: '',
      useTLS: false
    }

    const client = buildRedisClient(redisConfig)

    expect(Cluster).toHaveBeenCalledWith(
      [{ host: 'localhost', port: 6379 }],
      {
        keyPrefix: 'test:',
        slotsRefreshTimeout: 10000,
        dnsLookup: expect.any(Function),
        redisOptions: { db: 0 }
      }
    )
    expect(Redis).not.toHaveBeenCalled()
    expect(createLogger).toHaveBeenCalled()
    expect(client instanceof MockCluster).toBeTruthy()
  })

  test('includes credentials when username is provided', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: true,
      username: 'user',
      password: 'pass',
      useTLS: false
    }

    const client = buildRedisClient(redisConfig) // eslint-disable-line no-unused-vars

    expect(Redis).toHaveBeenCalledWith({
      port: 6379,
      host: 'localhost',
      db: 0,
      keyPrefix: 'test:',
      username: 'user',
      password: 'pass'
    })
  })

  test('includes TLS options when useTLS is true', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: true,
      username: '',
      password: '',
      useTLS: true
    }

    const client = buildRedisClient(redisConfig) // eslint-disable-line no-unused-vars

    expect(Redis).toHaveBeenCalledWith({
      port: 6379,
      host: 'localhost',
      db: 0,
      keyPrefix: 'test:',
      tls: {}
    })
  })

  test('logs info message when connection is established', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: true,
      username: '',
      password: '',
      useTLS: false
    }

    const client = buildRedisClient(redisConfig)
    client.emit('connect')

    expect(mockLogger.info).toHaveBeenCalledWith('Connected to Redis server')
  })

  test('logs error message when connection error occurs', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: true,
      username: '',
      password: '',
      useTLS: false
    }
    const testError = new Error('Connection failed')

    const client = buildRedisClient(redisConfig)
    client.emit('error', testError)

    expect(mockLogger.error).toHaveBeenCalledWith('Redis connection error Error: Connection failed')
  })

  test('dnsLookup function returns the provided address', () => {
    const redisConfig = {
      keyPrefix: 'test:',
      host: 'localhost',
      useSingleInstanceCache: false,
      username: '',
      password: '',
      useTLS: false
    }

    const client = buildRedisClient(redisConfig) // eslint-disable-line no-unused-vars
    const dnsLookup = Cluster.mock.calls[0][1].dnsLookup
    const callbackMock = vi.fn()

    dnsLookup('test.address', callbackMock)

    expect(callbackMock).toHaveBeenCalledWith(null, 'test.address')
  })
})
