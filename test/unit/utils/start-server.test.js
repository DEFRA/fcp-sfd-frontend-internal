import { vi, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'

const mockLoggerInfo = vi.fn()
const mockLoggerError = vi.fn()
const mockHapiLoggerInfo = vi.fn()
const mockHapiLoggerError = vi.fn()

const mockServer = {
  start: vi.fn().mockResolvedValue(),
  stop: vi.fn().mockResolvedValue(),
  logger: {
    info: mockHapiLoggerInfo,
    error: mockHapiLoggerError
  },
  events: {
    on: vi.fn(),
    once: vi.fn(),
    removeAllListeners: vi.fn()
  },
  listeners: vi.fn().mockReturnValue([]),
  removeAllListeners: vi.fn()
}

vi.mock('hapi-pino', () => ({
  register: (server) => {
    server.decorate('server', 'logger', {
      info: mockHapiLoggerInfo,
      error: mockHapiLoggerError
    })
  },
  name: 'mock-hapi-pino'
}))

vi.mock('@hapi/hapi', () => ({
  server: vi.fn().mockReturnValue(mockServer),
  default: {
    server: vi.fn().mockReturnValue(mockServer)
  }
}))

vi.mock('../../../src/utils/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

vi.mock('../../../src/server.js', () => ({
  createServer: vi.fn().mockResolvedValue(mockServer)
}))

const startServerModule = await import('../../../src/utils/start-server.js')
const serverModule = await import('../../../src/server.js')
const { config } = await import('../../../src/config/index.js')

describe('#startServer', () => {
  const PROCESS_ENV = process.env
  let server

  beforeAll(() => {
    process.env = { ...PROCESS_ENV }
    process.env.PORT = '3097'
    config.set('server.port', '3097')
  })

  afterAll(() => {
    process.env = PROCESS_ENV
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
    process.removeAllListeners('uncaughtException')
    process.removeAllListeners('unhandledRejection')

    vi.useRealTimers()
  })

  describe('When server starts', () => {
    test('Should start up server as expected', async () => {
      server = await startServerModule.startServer()

      expect(serverModule.createServer).toHaveBeenCalled()
      expect(mockServer.start).toHaveBeenCalled()
      expect(mockHapiLoggerInfo).toHaveBeenCalledWith('Server started successfully')
      expect(mockHapiLoggerInfo).toHaveBeenCalledWith('Access your frontend on http://localhost:3097')
    })
  })

  describe('When server start fails', () => {
    beforeEach(() => {
      serverModule.createServer.mockRejectedValueOnce(new Error('Server failed to start'))
    })

    test('Should log failed startup message', async () => {
      try {
        server = await startServerModule.startServer()
      } catch (error) {
      }

      expect(mockLoggerInfo).toHaveBeenCalledWith('Server failed to start :(')
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Server failed to start' })
      )
    })
  })
})
