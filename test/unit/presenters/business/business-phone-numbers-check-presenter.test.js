// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessPhoneNumbersCheckPresenter } from '../../../../src/presenters/business/business-phone-numbers-check-presenter.js'

describe('businessPhoneNumbersCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      },
      contact: {
        landline: '01234 567891',
        mobile: '01111 111111'
      },
      changeBusinessMobile: null,
      changeBusinessTelephone: null
    }
  })

  describe('when provided with business phone numbers check data', () => {
    test('it correctly presents the data', () => {
      const result = businessPhoneNumbersCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-phone-numbers-change' },
        changeLink: '/business-phone-numbers-change',
        pageTitle: 'Check your business phone numbers are correct before submitting',
        metaDescription: 'Check the phone numbers for your business are correct.',
        businessName: 'Agile Farm Ltd',
        sbi: '123456789',
        userName: 'Alfred Waldron',
        businessMobile: null,
        businessTelephone: null
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.businessName).toEqual(null)
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.customer.fullName
      })

      test('it should return userName as null', () => {
        const result = businessPhoneNumbersCheckPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })
})
