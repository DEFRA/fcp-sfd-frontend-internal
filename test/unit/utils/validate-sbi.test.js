// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { validateSbi } from '../../../src/utils/validate-sbi.js'

describe('validateSbi', () => {
  let h
  let takeover

  beforeEach(() => {
    takeover = { takeoverResponse: true }

    h = {
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn().mockReturnValue(takeover) })
    }
  })

  test('should return null when the sbi is valid', () => {
    const result = validateSbi('106705779', h)

    expect(result).toBeNull()
    expect(h.redirect).not.toHaveBeenCalled()
  })

  test('should return a takeover redirect to /search-sbi when the sbi is invalid', () => {
    const result = validateSbi('invalid', h)

    expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
    expect(result).toBe(takeover)
  })
})
