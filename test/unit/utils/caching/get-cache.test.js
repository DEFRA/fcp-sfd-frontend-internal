// Test framework dependencies
import { describe, it, expect, vi } from 'vitest'

// Thing under test
import { getCache } from '../../../../src/utils/caching/get-cache.js'

// Things we need to mock
import { server } from '../../../../src/server.js'

// Mocks
vi.mock('../../../../src/server.js', () => ({
  server: {
    app: {
      cache: {
        get: vi.fn(),
        set: vi.fn()
      }
    }
  }
}))

describe('getCache', () => {
  it('should return the cache instance from server.app', () => {
    const cache = getCache()

    expect(cache).toBe(server.app.cache)
  })

  it('should expose the mocked cache methods', () => {
    const cache = getCache()

    expect(typeof cache.get).toBe('function')
    expect(typeof cache.set).toBe('function')
  })
})
