// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalPhoneNumbersCheckPresenter } from '../../../../src/presenters/personal/personal-phone-numbers-check-presenter.js'

describe('personalPhoneNumbersCheckPresenter', () => {
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
      },
      changePersonalPhoneNumbers: {
        personalTelephone: '01234567890',
        personalMobile: '07123456789'
      }
    }
  })

  describe('when provided with personal phone numbers change data', () => {
    test('it correctly presents the data', () => {
      const result = personalPhoneNumbersCheckPresenter(data, crn)

      expect(result).toEqual({
        backLink: '/customer/1234567890/account-phone-numbers-change',
        changeLink: '/customer/1234567890/account-phone-numbers-change',
        pageTitle: 'Check your personal phone numbers are correct before submitting',
        metaDescription: 'Check the phone numbers for your personal account are correct.',
        userName: 'John Doe',
        personalTelephone: {
          telephone: '01234567890',
          mobile: '07123456789'
        }
      })
    })
  })

  describe('the "backLink" property', () => {
    test('it directs to the phone numbers change page', () => {
      const result = personalPhoneNumbersCheckPresenter(data, crn)

      expect(result.backLink).toBe('/customer/1234567890/account-phone-numbers-change')
    })

    test('it falls back to the search page when the crn is missing', () => {
      const result = personalPhoneNumbersCheckPresenter(data, undefined)

      expect(result.backLink).toBe('/search-crn')
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalPhoneNumbersCheckPresenter(data, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "personalTelephone" property', () => {
    describe('when a phone number is not provided', () => {
      beforeEach(() => {
        data.changePersonalPhoneNumbers = {
          personalTelephone: null,
          personalMobile: '07123456789'
        }
      })

      test('it should return the missing number as null', () => {
        const result = personalPhoneNumbersCheckPresenter(data, crn)

        expect(result.personalTelephone).toEqual({
          telephone: null,
          mobile: '07123456789'
        })
      })
    })

    describe('when the mobile number is not provided', () => {
      beforeEach(() => {
        data.changePersonalPhoneNumbers = {
          personalTelephone: '01234567890',
          personalMobile: null
        }
      })

      test('it should return the missing number as null', () => {
        const result = personalPhoneNumbersCheckPresenter(data, crn)

        expect(result.personalTelephone).toEqual({
          telephone: '01234567890',
          mobile: null
        })
      })
    })
  })

  describe('when there is no pending change in the session', () => {
    beforeEach(() => {
      delete data.changePersonalPhoneNumbers
    })

    test('it falls back to the saved phone numbers', () => {
      const result = personalPhoneNumbersCheckPresenter(data, crn)

      expect(result.personalTelephone).toEqual({
        telephone: '01111111111',
        mobile: '02222222222'
      })
    })
  })
})
