// Test framework dependencies
import { describe, it, expect, vi } from 'vitest'

// Thing under test
import { get } from '../../../../src/utils/caching/get.js'

// Mocks
const mockCache = {
  get: vi.fn()
}

describe('get', () => {
  it('should call cache.get with the correct key', async () => {
    const key = 'myKey'
    const value = 'cachedValue'
    mockCache.get.mockResolvedValueOnce(value)

    const result = await get(key, mockCache)

    expect(mockCache.get).toHaveBeenCalledWith(key)
    expect(result).toBe(value)
  })

  it('should return undefined if key is not in cache', async () => {
    const key = 'missingKey'
    mockCache.get.mockResolvedValueOnce(undefined)

    const result = await get(key, mockCache)

    expect(mockCache.get).toHaveBeenCalledWith(key)
    expect(result).toBeUndefined()
  })
})
