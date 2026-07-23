// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { buildBusinessSuccessMessage } from '../../../../src/services/business/build-business-success-message-service.js'

describe('buildBusinessSuccessMessage', () => {
  describe('when a single business detail was updated', () => {
    test('returns a plain text notification', () => {
      const result = buildBusinessSuccessMessage({
        orderedSectionsToFix: ['email'],
        changeBusinessEmail: { businessEmail: 'new@example.com' }
      })

      expect(result).toEqual({
        type: 'text',
        value: 'You have updated your business email address'
      })
    })
  })

  describe('when multiple business details were updated', () => {
    test('returns an HTML notification listing each change', () => {
      const result = buildBusinessSuccessMessage({
        orderedSectionsToFix: ['email', 'email'],
        changeBusinessEmail: { businessEmail: 'new@example.com' }
      })

      expect(result.type).toBe('html')
      expect(result.value).toContain('You have updated your:')
      expect(result.value).toContain('<li>business email address</li>')
    })
  })

  describe('when no matching change is present', () => {
    test('returns an HTML notification with an empty list', () => {
      const result = buildBusinessSuccessMessage({
        orderedSectionsToFix: ['name'],
        changeBusinessEmail: { businessEmail: 'new@example.com' }
      })

      expect(result.type).toBe('html')
      expect(result.value).not.toContain('<li>')
    })
  })

  describe('when the email section is fixed but no email change exists', () => {
    test('does not include the email change', () => {
      const result = buildBusinessSuccessMessage({
        orderedSectionsToFix: ['email'],
        changeBusinessEmail: undefined
      })

      expect(result.type).toBe('html')
      expect(result.value).not.toContain('business email address')
    })
  })
})
