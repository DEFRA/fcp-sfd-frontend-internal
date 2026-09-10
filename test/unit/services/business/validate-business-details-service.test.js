// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { validateBusinessDetailsService } from '../../../../src/services/business/validate-business-details-service.js'

// Test helpers
import { businessDetailsMapped } from '../../../mocks/business-details-mapped.js'

describe('validateBusinessDetailsService', () => {
  let businessDetails

  beforeEach(() => {
    businessDetails = businessDetailsMapped()
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

  describe('when the business name is missing', () => {
    beforeEach(() => {
      businessDetails.info.businessName = null
    })

    test('returns hasValidBusinessDetails as false', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.hasValidBusinessDetails).toBe(false)
    })

    test('returns the sections needing update', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['name'])
    })
  })

  describe('when both phone numbers are missing', () => {
    beforeEach(() => {
      businessDetails.contact.landline = null
      businessDetails.contact.mobile = null
    })

    test('returns the phone section as needing update', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['phone'])
    })
  })

  describe('when the email is invalid', () => {
    beforeEach(() => {
      businessDetails.contact.email = 'not-an-email'
    })

    test('returns the email section as needing update', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['email'])
    })
  })

  describe('when multiple sections are invalid', () => {
    beforeEach(() => {
      businessDetails.info.businessName = null
      businessDetails.contact.email = 'not-an-email'
    })

    test('returns all affected sections', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(expect.arrayContaining(['name', 'email']))
      expect(result.sectionsNeedingUpdate).toHaveLength(2)
    })
  })

  describe('when the vat number is not nine digits', () => {
    beforeEach(() => {
      businessDetails.info.vat = 'GB123456789'
    })

    test('returns the vat section as needing update', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['vat'])
    })
  })

  describe('when the vat number is missing', () => {
    beforeEach(() => {
      businessDetails.info.vat = null
    })

    test('it does not flag the vat section, because vat is optional', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })

  describe('when the address has a uprn', () => {
    beforeEach(() => {
      businessDetails.address.manual.line1 = null
      businessDetails.address.postcode = null
    })

    test('it does not validate the address', () => {
      const result = validateBusinessDetailsService(businessDetails)

      expect(result.hasValidBusinessDetails).toBe(true)
      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })

  describe('when the address has no uprn', () => {
    beforeEach(() => {
      businessDetails.address.lookup.uprn = null
    })

    describe('and the address is complete', () => {
      test('it does not flag the address section', () => {
        const result = validateBusinessDetailsService(businessDetails)

        expect(result.sectionsNeedingUpdate).toEqual([])
      })
    })

    describe('and the address is incomplete', () => {
      beforeEach(() => {
        businessDetails.address.manual.line1 = null
      })

      test('it returns the address section', () => {
        const result = validateBusinessDetailsService(businessDetails)

        expect(result.sectionsNeedingUpdate).toEqual(['address'])
      })
    })
  })
})
