import { describe, test, expect } from 'vitest'
import { getSafeBackLink } from '../../../src/utils/get-safe-back-link.js'

describe('getSafeBackLink', () => {
  test('returns the referer when it is a safe relative path', () => {
    expect(getSafeBackLink('/business/106705779/details', '/fallback')).toBe('/business/106705779/details')
  })

  test('extracts the path from a same-origin absolute referer', () => {
    expect(getSafeBackLink('https://example.com/business/106705779/details?foo=bar', '/fallback')).toBe('/business/106705779/details?foo=bar')
  })

  test('falls back when the referer is missing', () => {
    expect(getSafeBackLink(undefined, '/fallback')).toBe('/fallback')
  })

  test('falls back when the referer is an empty string', () => {
    expect(getSafeBackLink('', '/fallback')).toBe('/fallback')
  })

  test('falls back when the referer is protocol-relative', () => {
    expect(getSafeBackLink('//evil.com/phish', '/fallback')).toBe('/fallback')
  })

  test('falls back when the referer uses a disallowed protocol', () => {
    expect(getSafeBackLink('javascript:alert(1)', '/fallback')).toBe('/fallback')
  })

  test('falls back when the referer is not a valid url', () => {
    expect(getSafeBackLink('not a url', '/fallback')).toBe('/fallback')
  })
})
