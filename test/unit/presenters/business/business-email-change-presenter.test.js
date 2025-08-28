// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailChangePresenter } from '../../../../src/presenters/business/business-email-change-presenter.js'

describe('businessEmailChangePresenter', () => {
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
        email: 'test@test.com'
      }
    }
  })

  describe('when provided with business email change data', () => {
    test('it correctly presents the data', () => {
      const result = businessEmailChangePresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'What is your business email address?',
        metaDescription: 'Update the email address for your business.',
        businessName: 'Agile Farm Ltd',
        sbi: '123456789',
        userName: 'Alfred Waldron',
        businessEmail: 'test@test.com'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessEmailChangePresenter(data)

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
        const result = businessEmailChangePresenter(data)

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
        const result = businessEmailChangePresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "businessEmail" property', () => {
    describe('when provided with a changed businessEmail', () => {
      beforeEach(() => {
        data.changeBusinessEmail = 'new-email@new-email.com'
      })

      test('it should return the changed businessEmail as the businessEmail', () => {
        const result = businessEmailChangePresenter(data)

        expect(result.businessEmail).toEqual('new-email@new-email.com')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = 'even-newer-email@email.com'
      })

      test('it should return the payload as the businessEmail', () => {
        const result = businessEmailChangePresenter(data, payload)

        expect(result.businessEmail).toEqual('even-newer-email@email.com')
      })
    })
  })
})
