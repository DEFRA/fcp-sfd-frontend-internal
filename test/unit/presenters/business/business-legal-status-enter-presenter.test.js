// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { businessLegalStatusEnterPresenter } from '../../../../src/presenters/business/business-legal-status-enter-presenter.js'

describe('businessLegalStatusEnterPresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: { sbi: '106705779' },
      changeBusinessLegalStatus: constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0]
    }
    payload = undefined
  })

  describe('when the selected legal status requires a charity registration number', () => {
    test('it correctly presents the data', () => {
      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.backLink).toEqual({ href: '/business/106705779/business-legal-status-change' })
      expect(result.pageTitle).toBe('Enter the charity commission registration number')
      expect(result.metaDescription).toBe('Enter the Charity Commission registration number for this business.')
      expect(result.hintText).toBe('This is 7 or 8 numbers, for example, 12345678.')
      expect(result.field).toBe('charityCommissionRegistrationNumber')
    })

    test('it uses the in-progress session value when present', () => {
      data.changeBusinessCharityCommissionRegistrationNumber = '1234567'

      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.registrationNumber).toBe('1234567')
    })

    test('it uses the submitted payload over the session value', () => {
      data.changeBusinessCharityCommissionRegistrationNumber = '1234567'
      payload = { charityCommissionRegistrationNumber: '7654321' }

      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.registrationNumber).toBe('7654321')
    })
  })

  describe('when the selected legal status requires a company registration number', () => {
    beforeEach(() => {
      data.changeBusinessLegalStatus = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES[0]
    })

    test('it correctly presents the data', () => {
      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.pageTitle).toBe('Enter the company registration number')
      expect(result.metaDescription).toBe('Enter the company registration number for this business.')
      expect(result.hintText).toBe('This is 8 characters, which may be either 8 numbers or 2 letters and 6 numbers. For example, 12345678 or SC123456.')
      expect(result.field).toBe('companyRegistrationNumber')
    })

    test('it uses the in-progress session value when present', () => {
      data.changeBusinessCompanyRegistrationNumber = '12345678'

      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.registrationNumber).toBe('12345678')
    })
  })

  describe('the "backLink" property', () => {
    test('it falls back to the search page when the sbi is missing', () => {
      delete data.info.sbi

      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.backLink).toEqual({ href: '/search-sbi' })
    })
  })

  describe('the "registrationNumber" property', () => {
    test('it is null when nothing has been entered', () => {
      const result = businessLegalStatusEnterPresenter(data, payload)

      expect(result.registrationNumber).toBeNull()
    })
  })
})
