// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { validatePersonalDetailsService } from '../../../../src/services/personal/validate-personal-details-service.js'

// Test helpers
import { personalDetailsMapped } from '../../../mocks/personal-details-mapped.js'

describe('validatePersonalDetailsService', () => {
  let personalDetails

  beforeEach(() => {
    personalDetails = personalDetailsMapped()
  })

  describe('when personal details are valid', () => {
    test('returns hasValidPersonalDetails as true', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.hasValidPersonalDetails).toBe(true)
    })

    test('returns an empty sectionsNeedingUpdate array', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })

  describe('when personal details are invalid', () => {
    beforeEach(() => {
      personalDetails.fullName.first = ''
    })

    test('returns hasValidPersonalDetails as false', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.hasValidPersonalDetails).toBe(false)
    })

    test('returns the sections needing update', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['name'])
    })
  })

  describe('when multiple schema errors map to the same section', () => {
    beforeEach(() => {
      personalDetails.fullName.first = ''
      personalDetails.fullName.last = ''
    })

    test('only returns the section once', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['name'])
    })
  })

  describe('when multiple sections are invalid', () => {
    beforeEach(() => {
      personalDetails.fullName.first = ''
      personalDetails.email = 'not-an-email'
    })

    test('returns all affected sections', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['name', 'email'])
    })
  })

  describe('when both telephone and mobile are missing', () => {
    beforeEach(() => {
      personalDetails.telephone = null
      personalDetails.mobile = null
    })

    test('maps the error to the phone section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toContain('phone')
    })
  })

  describe('when only a telephone number is provided', () => {
    beforeEach(() => {
      personalDetails.mobile = null
    })

    test('does not flag the phone section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).not.toContain('phone')
    })
  })

  describe('when only a mobile number is provided', () => {
    beforeEach(() => {
      personalDetails.telephone = null
    })

    test('does not flag the phone section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).not.toContain('phone')
    })
  })

  describe('when address validation fails', () => {
    beforeEach(() => {
      personalDetails.address.lookup.uprn = null
      personalDetails.address.manual.line1 = ''
    })

    test('maps the error to the address section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['address'])
    })
  })

  describe('when a UPRN is present', () => {
    beforeEach(() => {
      personalDetails.address.lookup.uprn = '123456789'
      personalDetails.address.manual.line1 = ''
    })

    test('does not return address as needing update', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).not.toContain('address')
      expect(result.hasValidPersonalDetails).toBe(true)
    })
  })

  describe('when date of birth is completely missing', () => {
    beforeEach(() => {
      personalDetails.dateOfBirth.day = ''
      personalDetails.dateOfBirth.month = ''
      personalDetails.dateOfBirth.year = ''
    })

    test('maps the error to the dob section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['dob'])
    })
  })

  describe('when date of birth is invalid', () => {
    beforeEach(() => {
      personalDetails.dateOfBirth.day = '31'
      personalDetails.dateOfBirth.month = '2'
      personalDetails.dateOfBirth.year = '2020'
    })

    test('maps the error to the dob section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['dob'])
    })
  })

  describe('when date of birth is in the future', () => {
    beforeEach(() => {
      personalDetails.dateOfBirth.day = '1'
      personalDetails.dateOfBirth.month = '1'
      personalDetails.dateOfBirth.year = '3000'
    })

    test('maps the error to the dob section', () => {
      const result = validatePersonalDetailsService(personalDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['dob'])
    })
  })
})
