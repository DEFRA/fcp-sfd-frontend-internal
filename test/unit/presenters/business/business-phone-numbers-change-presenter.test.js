// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Things under test
import { businessPhoneNumbersChangePresenter } from '../../../../src/presenters/business/business-phone-numbers-change-presenter.js'

describe('businessPhoneNumbersChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: {
        sbi: '106705779',
        businessName: 'Agile Farm Ltd'
      },
      customer: {
        userName: 'Alfred Waldron'
      },
      contact: {
        landline: '01234 567891',
        mobile: null
      },
      changeBusinessPhoneNumbers: {}
    }

    payload = undefined
  })

  describe('when provided with business phone numbers change data', () => {
    test('it correctly presents the data', () => {
      const result = businessPhoneNumbersChangePresenter(data)

      expect(result).toEqual({
        backLink: '/business/106705779/details',
        pageTitle: 'What are your business phone numbers?',
        metaDescription: 'Update the phone numbers for your business.',
        businessName: 'Agile Farm Ltd',
        sbi: '106705779',
        userName: 'Alfred Waldron',
        businessMobile: null,
        businessTelephone: '01234 567891'
      })
    })
  })

  describe('the "businessTelephone" and "businessMobile" properties', () => {
    describe('when there is no change or payload', () => {
      test('it uses the current business telephone and business mobile numbers', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessTelephone).toBe('01234 567891')
        expect(result.businessMobile).toBe(null)
      })
    })

    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessPhoneNumbers = {
          businessTelephone: '01111 111111',
          businessMobile: '09876 543210'
        }
      })

      test('it prefers the in-progress change over the current numbers', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessTelephone).toBe('01111 111111')
        expect(result.businessMobile).toBe('09876 543210')
      })
    })

    describe('when there is a submitted payload', () => {
      beforeEach(() => {
        data.changeBusinessPhoneNumbers = {
          businessTelephone: '01111 111111',
          businessMobile: '09876 543210'
        }

        payload = {
          businessTelephone: '02222 222222',
          businessMobile: ''
        }
      })

      test('it prefers the submitted payload over everything else', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessTelephone).toBe('02222 222222')
        expect(result.businessMobile).toBe('')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the sbi is present', () => {
      test('it returns the sbi details page', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.backLink).toEqual('/business/106705779/details')
      })
    })

    describe('when the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.backLink).toEqual('/search-sbi')
      })
    })
  })

  describe('the "businessName" property', () => {
    test('it should return the business name', () => {
      const result = businessPhoneNumbersChangePresenter(data, payload)

      expect(result.businessName).toBe('Agile Farm Ltd')
    })

    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessName).toEqual(null)
      })
    })
  })

  describe('the "sbi" property', () => {
    test('it should return the sbi', () => {
      const result = businessPhoneNumbersChangePresenter(data, payload)

      expect(result.sbi).toBe('106705779')
    })

    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return the sbi as null', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "userName" property', () => {
    test('it should return the user name', () => {
      const result = businessPhoneNumbersChangePresenter(data, payload)

      expect(result.userName).toBe('Alfred Waldron')
    })

    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.customer.userName
      })

      test('it should return the userName as null', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.userName).toEqual(null)
      })
    })
  })
})
