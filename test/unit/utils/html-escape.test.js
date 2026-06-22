// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { htmlEscape } from '../../../src/utils/html-escape.js'

describe('htmlEscape', () => {
  describe('when the text contains HTML special characters', () => {
    test('it escapes ampersands', () => {
      expect(htmlEscape('Marks & Spencer')).toBe('Marks &amp; Spencer')
    })

    test('it escapes less-than signs', () => {
      expect(htmlEscape('a < b')).toBe('a &lt; b')
    })

    test('it escapes greater-than signs', () => {
      expect(htmlEscape('a > b')).toBe('a &gt; b')
    })

    test('it escapes double quotes', () => {
      expect(htmlEscape('say "hello"')).toBe('say &quot;hello&quot;')
    })

    test('it escapes single quotes', () => {
      expect(htmlEscape("it's mine")).toBe('it&#39;s mine')
    })

    test('it escapes all special characters in a single string', () => {
      expect(htmlEscape('<a href="#">Tom & Jerry\'s</a>'))
        .toBe('&lt;a href=&quot;#&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;')
    })
  })

  describe('when the text contains a script tag (XSS attempt)', () => {
    test('it escapes the markup so it renders as text', () => {
      expect(htmlEscape('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })
  })

  describe('when the text contains no special characters', () => {
    test('it returns the text unchanged', () => {
      expect(htmlEscape('Jane Smith')).toBe('Jane Smith')
    })
  })

  describe('when the text is an empty string', () => {
    test('it returns an empty string', () => {
      expect(htmlEscape('')).toBe('')
    })
  })

  describe('when the value is not a string', () => {
    test('it coerces a number to a string', () => {
      expect(htmlEscape(1234567890)).toBe('1234567890')
    })

    test('it coerces null to a string', () => {
      expect(htmlEscape(null)).toBe('null')
    })

    test('it coerces undefined to a string', () => {
      expect(htmlEscape(undefined)).toBe('undefined')
    })
  })
})
