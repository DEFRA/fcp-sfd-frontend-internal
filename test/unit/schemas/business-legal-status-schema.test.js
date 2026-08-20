// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessLegalStatusSchema } from '../../../src/schemas/business-legal-status-schema.js'
import { BUSINESS_LEGAL_STATUS_CODES } from '../../../src/constants/business-legal-status.js'

describe('business legal status schema', () => {
  let payload
  let schema

  beforeEach(() => {
    schema = businessLegalStatusSchema

    payload = {
      businessLegalStatus: BUSINESS_LEGAL_STATUS_CODES[0]
    }
  })

  describe('when valid data is provided', () => {
    test('it confirms the data is valid when businessLegalStatus is a recognised code', () => {
      const { error, value } = schema.validate(payload, { abortEarly: false })

      expect(error).toBeUndefined()
      expect(value).toEqual(payload)
    })

    test('it accepts every code defined in BUSINESS_LEGAL_STATUS_CODES', () => {
      const invalidCodes = BUSINESS_LEGAL_STATUS_CODES.filter(
        (code) => schema.validate({ businessLegalStatus: code }).error
      )

      expect(invalidCodes).toEqual([])
    })
  })

  describe('when invalid data is provided', () => {
    describe('because "businessLegalStatus" is missing', () => {
      beforeEach(() => {
        delete payload.businessLegalStatus
      })

      test('it returns the expected error message', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0].message).toBe('Select a legal status')
      })
    })

    describe('because "businessLegalStatus" is an empty string', () => {
      beforeEach(() => {
        payload.businessLegalStatus = ''
      })

      test('it returns the expected error message', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0].message).toBe('Select a legal status')
      })
    })

    describe('because "businessLegalStatus" is not a recognised code', () => {
      beforeEach(() => {
        payload.businessLegalStatus = '999999'
      })

      test('it returns the expected error message', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0].message).toBe('Select a legal status')
      })
    })
  })
})
