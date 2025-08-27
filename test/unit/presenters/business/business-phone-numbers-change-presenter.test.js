// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessPhoneNumbersChangePresenter } from '../../../../src/presenters/business/business-phone-numbers-change-presenter.js'

describe('businessPhoneNumbersChangePresenter', () => {
  let data
  let payload

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
        mobile: null
      }
    }
  })

  describe('when provided with business phone numbers change data', () => {
    test('it correctly presents the data', () => {
      const result = businessPhoneNumbersChangePresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'What are your business phone numbers?',
        metaDescription: 'Update the phone numbers for your business.',
        businessName: 'Agile Farm Ltd',
        sbi: '123456789',
        userName: 'Alfred Waldron',
        businessMobile: null,
        businessTelephone: '01234 567891'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessPhoneNumbersChangePresenter(data)

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
        const result = businessPhoneNumbersChangePresenter(data)

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
        const result = businessPhoneNumbersChangePresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "businessMobile" property', () => {
    describe('when provided with a changed businessMobile', () => {
      beforeEach(() => {
        data.changeBusinessMobile = '01111 111111'
      })

      test('it should return businessMobile as the changed businessMobile', () => {
        const result = businessPhoneNumbersChangePresenter(data)

        expect(result.businessMobile).toEqual('01111 111111')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = { businessMobile: '01234 111111' }
      })

      test('it should return businessMobile as the payload', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessMobile).toEqual('01234 111111')
      })
    })
  })

  describe('the "businessTelephone" property', () => {
    describe('when provided with a changed businessTelephone', () => {
      beforeEach(() => {
        data.changeBusinessTelephone = '01214 151151'
      })

      test('it should return businessTelephone as the changed businessTelephone', () => {
        const result = businessPhoneNumbersChangePresenter(data)

        expect(result.businessTelephone).toEqual('01214 151151')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = { businessTelephone: '02222 222222' }
      })

      test('it should return businessTelephone as the payload', () => {
        const result = businessPhoneNumbersChangePresenter(data, payload)

        expect(result.businessTelephone).toEqual('02222 222222')
      })
    })
  })
})
