import { vi, describe, test, expect, afterAll } from 'vitest'
import { createServer, getTokenCache } from '../../../src/server.js'

vi.mock('../../../src/plugins/index.js', () => ({
  plugins: [] // do not register plugins as it causes server to hang
}))

let server

afterAll(async () => {
  if (server) {
    await server.stop()
  }
})

describe('When the server starts', () => {
  test('the tokenCache should be defined', async () => {
    server = await createServer()
    await server.initialize()
    expect(server.app.tokenCache).toBeDefined()
  })
})

describe('When the tokenCache is defined', () => {
  test('the tokenCache allows set/get', async () => {
    const key = 'testKey'
    const value = { test: 'val' }

    await server.app.tokenCache.set(key, value, 1000)
    const cachedValue = await server.app.tokenCache.get(key)

    expect(cachedValue).toEqual(value)
  })

  test('using getTokenCache returns the same instance', () => {
    expect(getTokenCache()).toBe(server.app.tokenCache)
  })
})

describe('When the tokenCache is undefined', () => {
  test('getTokenCache throws an error', async () => {
    const mod = await vi.importActual('../../../src/server.js')

    // Overwrite getTokenCache to simulate if the cache is not created
    const mockedModule = {
      ...mod,
      getTokenCache: () => {
        throw new Error('Token cache is not initialized.')
      }
    }

    expect(() => mockedModule.getTokenCache()).toThrowError(
      'Token cache is not initialized.'
    )
  })
})
