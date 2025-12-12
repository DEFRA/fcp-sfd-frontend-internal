import { vi, describe, test, expect, afterAll, beforeAll, beforeEach } from 'vitest'
import { createServer } from '../../../src/server.js'
import { getTokenCache } from '../../../src/utils/caching/token-cache.js'

vi.mock('../../../src/plugins/index.js', () => ({
  plugins: [] // do not register plugins as it causes server to hang
}))

let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

beforeEach(async () => {
  vi.resetModules()
})

afterAll(async () => {
  if (server) {
    await server.stop()
  }
})

describe('When the server starts', () => {
  test('the tokenCache should be defined', async () => {
    const result = getTokenCache()
    expect(result).toBeDefined()
  })
})

describe('When the tokenCache is defined', () => {
  test('the tokenCache allows set/get', async () => {
    const key = 'testKey'
    const value = { test: 'val' }

    const tokenCache = getTokenCache()

    await tokenCache.set(key, value, 10000)
    const cachedValue = await tokenCache.get(key)

    expect(cachedValue).toEqual(value)
  })

  test('using getTokenCache returns the same instance', () => {
    const tokenCache = getTokenCache()
    expect(tokenCache).toBe(server.app.tokenCache)
  })
})

describe('When the tokenCache is undefined', () => {
  test('getTokenCache throws an error', async () => {
    const mod = await vi.importActual('../../../src/utils/caching/token-cache.js')

    // Overwrite initTokenCache to simulate if the cache is not created
    const mockedModule = {
      ...mod,
      initTokenCache: () => undefined
    }

    expect(() => mockedModule.getTokenCache()).toThrowError(
      'Token cache is not initialized.'
    )
  })
})
