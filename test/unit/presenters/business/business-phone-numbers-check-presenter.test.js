// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessPhoneNumbersCheckPresenter } from '../../../../src/presenters/business/business-phone-numbers-check-presenter.js'

describe('businessPhoneNumbersCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        sbi: '106705779',
        businessName: 'Agile Farms Ltd'
      },
      contact: {
        landline: '01234 567891',
        mobile: '01111 111111'
      },
      changeBusinessPhoneNumbers: {
        businessMobile: null,
        businessTelephone: null
      }
    }
  })

  describe('when provided with business phone numbers check data', () => {
    test('it correctly presents the data', () => {
      const result = businessPhoneNumbersCheckPresenter(data)

      expect(result).toEqual({
        backLink: '/business/106705779/business-phone-numbers-change',
        changeLink: '/business/106705779/business-phone-numbers-change',
        pageTitle: 'Check your business phone numbers are correct before submitting',
        metaDescription: 'Check the phone numbers for your business are correct.',
        userName: null,
        businessMobile: null,
        businessTelephone: null,
        businessName: 'Agile Farms Ltd',
        sbi: '106705779'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the sbi is present', () => {
      test('it returns the business phone numbers change page', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.backLink).toEqual('/business/106705779/business-phone-numbers-change')
      })
    })

    describe('when the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.backLink).toEqual('/search-sbi')
      })
    })
  })

  describe('the "businessTelephone" and "businessMobile" properties', () => {
    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessPhoneNumbers = {
          businessTelephone: '01111 111111',
          businessMobile: '09876 543210'
        }
      })

      test('it uses the in-progress change business telephone and business mobile numbers', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.businessTelephone).toBe('01111 111111')
        expect(result.businessMobile).toBe('09876 543210')
      })
    })

    describe('when there is no in-progress change', () => {
      test('it falls back to the current business phone numbers', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.businessTelephone).toBe(null)
        expect(result.businessMobile).toBe(null)
      })
    })
  })

  describe('where there is no customer', () => {
    test('it defaults the userName to null', () => {
      const result = businessPhoneNumbersCheckPresenter(data)

      expect(result.userName).toBeNull()
    })
  })

  describe('the "businessName" and "sbi" properties', () => {
    test('it exposes the business name and sbi', () => {
      const result = businessPhoneNumbersCheckPresenter(data)

      expect(result.businessName).toBe('Agile Farms Ltd')
      expect(result.sbi).toBe('106705779')
    })
  })
})
