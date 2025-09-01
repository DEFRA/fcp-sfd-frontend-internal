// Test framework dependencies
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Thing under test
import { retry } from '../../../../../src/services/DAL/token/retry-service.js'

// Test helpers
import { DAL_TOKEN } from '../../../../../src/constants/cache-keys.js'

// Things we need to mock
import { drop } from '../../../../../src/utils/caching/drop.js'

// Mocks
vi.mock('../../../../../src/utils/caching/drop.js', () => ({
  drop: vi.fn()
}))

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runAllTimers() // Run any remaining scheduled timers to avoid hanging timers
    vi.useRealTimers() // Restore the real timer functions
    vi.clearAllMocks()
  })

  it('should return the result if the function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const resultPromise = retry(fn)

    // Run all scheduled timers immediately, allowing test to continue without real delays
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(drop).not.toHaveBeenCalled()
  })

  it('should drop DAL_TOKEN and retry function if it throws 401 error', async () => {
    const boomError = { isBoom: true, output: { statusCode: 401 } }
    const fn = vi.fn()
      .mockRejectedValueOnce(boomError)
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn)

    // Run all scheduled timers immediately, allowing test to continue without real delays
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result).toBe('success')
    expect(drop).toHaveBeenCalledWith(DAL_TOKEN)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
