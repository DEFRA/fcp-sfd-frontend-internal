import { vi, describe, test, expect, afterAll, beforeAll } from 'vitest'
import { createServer } from '../../../src/server.js'

vi.mock('../../../src/plugins/index.js', () => ({
  plugins: [] // do not register plugins as it causes server to hang
}))

let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  if (server) {
    await server.stop()
  }
})

describe('When the server starts', () => {
  test('the tokenCache should be defined', async () => {
    const result = server.app.tokenCache
    expect(result).toBeDefined()
  })
})

describe('When the tokenCache is defined', () => {
  test('the tokenCache allows set/get', async () => {
    const key = 'testKey'
    const value = { test: 'val' }

    const tokenCache = server.app.tokenCache

    await tokenCache.set(key, value, 10000)
    const cachedValue = await tokenCache.get(key)

    expect(cachedValue).toEqual(value)
  })

  test('using server.app.tokenCache returns the same instance', () => {
    const tokenCache = server.app.tokenCache
    expect(tokenCache).toBe(server.app.tokenCache)
  })
})
