// Test framework dependencies
import { describe, it, expect, vi } from 'vitest'

// Thing under test
import { drop } from '../../../../src/utils/caching/drop.js'

// Mocks
const mockCache = {
  drop: vi.fn()
}

describe('drop', () => {
  it('should call cache.drop with the correct key', async () => {
    const key = 'myKey'
    mockCache.drop.mockResolvedValueOnce(undefined)

    await drop(key, mockCache)

    expect(mockCache.drop).toHaveBeenCalledWith(key)
  })
})
