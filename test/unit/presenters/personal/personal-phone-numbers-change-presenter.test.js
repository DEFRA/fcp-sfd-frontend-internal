// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalPhoneNumbersChangePresenter } from '../../../../src/presenters/personal/personal-phone-numbers-change-presenter.js'

describe('personalPhoneNumbersChangePresenter', () => {
  let data
  const crn = '1234567890'

  beforeEach(() => {
    data = {
      info: {
        userName: 'John Doe',
        fullName: {
          first: 'John',
          last: 'Doe'
        }
      },
      contact: {
        telephone: '01111111111',
        mobile: '02222222222'
      }
    }
  })

  describe('when provided with personal phone numbers change data', () => {
    test('it correctly presents the data', () => {
      const result = personalPhoneNumbersChangePresenter(data, undefined, crn)

      expect(result).toEqual({
        backLink: '/customer/1234567890/details',
        pageTitle: 'What are your personal phone numbers?',
        metaDescription: 'Update the phone numbers for your personal account.',
        userName: 'John Doe',
        crn,
        personalTelephone: '01111111111',
        personalMobile: '02222222222'
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalPhoneNumbersChangePresenter(data, undefined, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the phone number properties', () => {
    describe('when provided with changed phone numbers in the session', () => {
      beforeEach(() => {
        data.changePersonalPhoneNumbers = {
          personalTelephone: '03333333333',
          personalMobile: '04444444444'
        }
      })

      test('it should return the changed phone numbers', () => {
        const result = personalPhoneNumbersChangePresenter(data, undefined, crn)

        expect(result.personalTelephone).toEqual('03333333333')
        expect(result.personalMobile).toEqual('04444444444')
      })
    })

    describe('when provided with a payload', () => {
      test('it should return the payload phone numbers', () => {
        const payload = {
          personalTelephone: '05555555555',
          personalMobile: '06666666666'
        }

        const result = personalPhoneNumbersChangePresenter(data, payload, crn)

        expect(result.personalTelephone).toEqual('05555555555')
        expect(result.personalMobile).toEqual('06666666666')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when a crn is provided', () => {
      test('it should link to the customer details page', () => {
        const result = personalPhoneNumbersChangePresenter(data, undefined, crn)

        expect(result.backLink).toEqual('/customer/1234567890/details')
      })
    })

    describe('when a crn is not provided', () => {
      test('it should link to the search-crn page', () => {
        const result = personalPhoneNumbersChangePresenter(data, undefined, undefined)

        expect(result.backLink).toEqual('/search-crn')
      })
    })
  })
})
