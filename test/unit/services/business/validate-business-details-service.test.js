// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { validateBusinessDetailsService } from '../../../../src/services/business/validate-business-details-service.js'

// Test fixtures
import { mappedData } from '../../../mocks/mock-business-details.js'

describe('validateBusinessDetailsService', () => {
  let businessDetails

  beforeEach(() => {
    businessDetails = structuredClone(mappedData)
    businessDetails.contact.email = 'business@example.com'
  })

  describe('when business details are valid', () => {
    test('returns hasValidBusinessDetails as true', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.hasValidBusinessDetails).toBe(true)
    })

    test('returns an empty sectionsNeedingUpdate array', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })

  describe('when the business email is invalid', () => {
    beforeEach(() => {
      businessDetails.contact.email = 'not-an-email'
    })

    test('returns hasValidBusinessDetails as false', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.hasValidBusinessDetails).toBe(false)
    })

    test('returns the email section as needing update', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['email'])
    })
  })

  describe('when the contact object is missing', () => {
    beforeEach(() => {
      delete businessDetails.contact
    })

    test('does not throw and flags the email section', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.hasValidBusinessDetails).toBe(false)
      expect(result.sectionsNeedingUpdate).toEqual(['email'])
    })
  })
})
