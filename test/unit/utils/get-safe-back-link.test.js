import { describe, test, expect } from 'vitest'
import { getSafeBackLink } from '../../../src/utils/get-safe-back-link.js'

describe('getSafeBackLink', () => {
  test('falls back when the referer is relative (real browsers only ever send an absolute Referer)', () => {
    expect(getSafeBackLink('/business/106705779/details', '/fallback')).toBe('/fallback')
  })

  test('falls back when the referer uses a backslash to disguise a protocol-relative host', () => {
    expect(getSafeBackLink('/\\evil.com', '/fallback')).toBe('/fallback')
  })

  test('extracts the path from an absolute http(s) referer', () => {
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
