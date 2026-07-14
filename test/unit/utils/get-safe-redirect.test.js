import { getSafeRedirect } from '../../../src/utils/get-safe-redirect.js'
import { describe, test, expect } from 'vitest'

describe('getSafeRedirect', () => {
  test('should return provided redirect if it is a local route starting with "/"', () => {
    const redirect = '/location'
    const result = getSafeRedirect(redirect)
    expect(result).toBe(redirect)
  })

  test('should return "/search-sbi" if redirect is not a local route', () => {
    const redirect = 'https://an.unsafe-location.com'
    const result = getSafeRedirect(redirect)
    expect(result).toBe('/search-sbi')
  })

  test('should return "/search-sbi" if redirect is a domain name only', () => {
    const redirect = 'an.unsafe-location.com'
    const result = getSafeRedirect(redirect)
    expect(result).toBe('/search-sbi')
  })

  test('should return "/search-sbi" if redirect is undefined', () => {
    const result = getSafeRedirect(undefined)
    expect(result).toBe('/search-sbi')
  })

  test('should return "/search-sbi" if redirect is null', () => {
    const result = getSafeRedirect(null)
    expect(result).toBe('/search-sbi')
  })
})
