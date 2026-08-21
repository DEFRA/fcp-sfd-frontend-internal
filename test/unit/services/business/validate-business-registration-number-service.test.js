// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { validateBusinessRegistrationNumberService } from '../../../../src/services/business/validate-business-registration-number-service.js'

describe('validateBusinessRegistrationNumberService', () => {
  describe('when the legal status requires a charity registration number', () => {
    let legalStatusCode

    beforeEach(() => {
      legalStatusCode = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0]
    })

    test('it returns the charity payload and session field names', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { charityCommissionRegistrationNumber: '1234567' })

      expect(result.payloadField).toBe('charityCommissionRegistrationNumber')
      expect(result.sessionField).toBe('changeBusinessCharityCommissionRegistrationNumber')
    })

    test('it validates a correctly formatted number without error', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { charityCommissionRegistrationNumber: '1234567' })

      expect(result.error).toBeUndefined()
      expect(result.value).toEqual({ charityCommissionRegistrationNumber: '1234567' })
    })

    test('it returns an error when the number is missing', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, {})

      expect(result.error.details[0].message).toBe('Enter the charity commission registration number')
    })

    test('it returns an error when the number is not 7 or 8 digits', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { charityCommissionRegistrationNumber: '123' })

      expect(result.error.details[0].message).toBe('Charity commission registration number must be 7 or 8 numbers')
    })
  })

  describe('when the legal status requires a company registration number', () => {
    let legalStatusCode

    beforeEach(() => {
      legalStatusCode = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES[0]
    })

    test('it returns the company payload and session field names', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { companyRegistrationNumber: '12345678' })

      expect(result.payloadField).toBe('companyRegistrationNumber')
      expect(result.sessionField).toBe('changeBusinessCompanyRegistrationNumber')
    })

    test('it validates a correctly formatted number without error', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { companyRegistrationNumber: '12345678' })

      expect(result.error).toBeUndefined()
      expect(result.value).toEqual({ companyRegistrationNumber: '12345678' })
    })

    test('it returns an error when the number is missing', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, {})

      expect(result.error.details[0].message).toBe('Enter the company registration number')
    })

    test('it returns an error when the number does not match the expected format', () => {
      const result = validateBusinessRegistrationNumberService(legalStatusCode, { companyRegistrationNumber: 'ABC12345' })

      expect(result.error.details[0].message).toBe('Company registration number must be 8 numbers, or 2 letters followed by 6 numbers')
    })
  })

  describe('when the legal status code is numeric rather than a string', () => {
    test('it still matches the charity codes correctly', () => {
      const legalStatusCode = Number(constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0])

      const result = validateBusinessRegistrationNumberService(legalStatusCode, { charityCommissionRegistrationNumber: '1234567' })

      expect(result.payloadField).toBe('charityCommissionRegistrationNumber')
    })
  })
})
