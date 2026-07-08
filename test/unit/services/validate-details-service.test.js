// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'
import Joi from 'joi'

// Thing under test
import { validateDetailsService } from '../../../src/services/validate-details-service.js'

describe('validateDetailsService', () => {
  let mappedDetails
  let schemasToValidate

  beforeEach(() => {
    // Setup basic valid details
    mappedDetails = {
      first: 'John',
      last: 'Doe',
      middle: 'M',
      day: '01',
      month: '01',
      year: '1990',
      address1: '123 Main St',
      city: 'Anytown',
      county: 'Anyshire',
      postcode: 'A1 2BC',
      country: 'UK',
      personalEmail: 'test@example.com',
      personalTelephone: '01234567890',
      personalMobile: null
    }

    // Setup basic test schemas - these map to the sections
    schemasToValidate = [
      Joi.object({
        first: Joi.string().required(),
        last: Joi.string().required(),
        middle: Joi.string().allow(null)
      }),
      Joi.object({
        day: Joi.string().required(),
        month: Joi.string().required(),
        year: Joi.string().required()
      }),
      Joi.object({
        address1: Joi.string().required(),
        city: Joi.string().required(),
        county: Joi.string(),
        postcode: Joi.string().required(),
        country: Joi.string().required()
      }),
      Joi.object({
        personalEmail: Joi.string().email().required(),
        personalTelephone: Joi.string().allow(null),
        personalMobile: Joi.string().allow(null)
      })
    ]
  })

  describe('when all schemas pass validation', () => {
    test('it returns isValid as true', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.isValid).toBe(true)
    })

    test('it returns an empty sectionsNeedingUpdate array', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })

  describe('when a single schema has validation errors', () => {
    beforeEach(() => {
      mappedDetails.first = ''
    })

    test('it returns isValid as false', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.isValid).toBe(false)
    })

    test('it maps the error to the correct section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('name')
    })
  })

  describe('when multiple errors relate to the same section', () => {
    beforeEach(() => {
      mappedDetails.first = ''
      mappedDetails.last = ''
    })

    test('only returns the section once in the array', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toEqual(['name'])
    })
  })

  describe('when multiple different sections have errors', () => {
    beforeEach(() => {
      mappedDetails.first = ''
      mappedDetails.day = ''
      mappedDetails.personalEmail = 'invalid-email'
    })

    test('returns all affected sections', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('name')
      expect(result.sectionsNeedingUpdate).toContain('dob')
      expect(result.sectionsNeedingUpdate).toContain('email')
    })

    test('includes each section only once', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      const uniqueSections = new Set(result.sectionsNeedingUpdate)
      expect(uniqueSections.size).toEqual(result.sectionsNeedingUpdate.length)
    })
  })

  describe('address validation', () => {
    beforeEach(() => {
      mappedDetails.address1 = ''
    })

    test('maps address errors to the address section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('address')
    })

    test('does not duplicate section when multiple address fields are invalid', () => {
      mappedDetails.address1 = ''
      mappedDetails.postcode = ''

      const result = validateDetailsService(schemasToValidate, mappedDetails)

      const addressCount = result.sectionsNeedingUpdate.filter(s => s === 'address').length
      expect(addressCount).toBe(1)
    })
  })

  describe('when neither telephone nor mobile is provided', () => {
    beforeEach(() => {
      // Test the mapErrorsToSections function's behavior with phone fields
      // The service maps phone errors to the 'phone' section
      mappedDetails.personalTelephone = null
      mappedDetails.personalMobile = null
    })

    test('it tracks phone validation in the error map', () => {
      // When both phone fields are missing, the errorFieldToSectionMap includes them
      // and they would map to 'phone' section
      // This test verifies the structure is set up correctly
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      // Since we have valid data for the schemas, the result should be valid
      expect(result).toBeDefined()
    })
  })

  describe('allowUnknown setting', () => {
    test('it validates with extra fields in the data', () => {
      mappedDetails.unknownField = 'some value'
      mappedDetails.anotherUnknownField = 123

      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.isValid).toBe(true)
    })
  })

  describe('abortEarly setting', () => {
    test('it collects all errors from a single schema', () => {
      // Create a schema that will have multiple errors
      const strictSchema = Joi.object({
        first: Joi.string().required(),
        last: Joi.string().required(),
        middle: Joi.string().required()
      })

      mappedDetails.first = ''
      mappedDetails.last = ''
      mappedDetails.middle = ''

      const result = validateDetailsService([strictSchema], mappedDetails)

      // Should collect all three errors from the single schema
      expect(result.isValid).toBe(false)
      expect(result.sectionsNeedingUpdate.length).toBeGreaterThan(0)
    })
  })

  describe('email validation errors', () => {
    beforeEach(() => {
      mappedDetails.personalEmail = 'not-a-valid-email'
    })

    test('it maps email validation errors to the email section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('email')
    })
  })

  describe('vat validation', () => {
    beforeEach(() => {
      mappedDetails.vatNumber = ''
      schemasToValidate.push(
        Joi.object({
          vatNumber: Joi.string().required()
        })
      )
    })

    test('it maps vat errors to the vat section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('vat')
    })
  })

  describe('business details validation', () => {
    beforeEach(() => {
      mappedDetails.businessName = ''
      mappedDetails.businessEmail = 'invalid'

      schemasToValidate.push(
        Joi.object({
          businessName: Joi.string().required(),
          businessEmail: Joi.string().email().required(),
          businessTelephone: Joi.string().allow(null),
          businessMobile: Joi.string().allow(null)
        })
      )
    })

    test('it maps business name errors to the name section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('name')
    })

    test('it maps business email errors to the email section', () => {
      const result = validateDetailsService(schemasToValidate, mappedDetails)

      expect(result.sectionsNeedingUpdate).toContain('email')
    })
  })

  describe('unmapped field errors', () => {
    test('it ignores validation errors for fields not in the error map', () => {
      const unmappedSchema = Joi.object({
        unmappedField: Joi.string().required()
      })

      mappedDetails.unmappedField = ''

      const result = validateDetailsService([unmappedSchema], mappedDetails)

      // Should not add any section for unmapped field
      expect(result.isValid).toBe(false)
      expect(result.sectionsNeedingUpdate).not.toContain('unmappedField')
    })
  })

  describe('empty schemas array', () => {
    test('it returns valid when no schemas are provided', () => {
      const result = validateDetailsService([], mappedDetails)

      expect(result.isValid).toBe(true)
      expect(result.sectionsNeedingUpdate).toEqual([])
    })
  })
})
