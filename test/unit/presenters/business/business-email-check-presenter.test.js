// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailCheckPresenter } from '../../../../src/presenters/business/business-email-check-presenter.js'

describe('businessEmailCheckPresenter', () => {
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
        email: 'test@test.com'
      }
    }
  })

  describe('when provided with business email check data', () => {
    test('it correctly presents the data', () => {
      const result = businessEmailCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-email-change' },
        changeLink: '/business-email-change',
        pageTitle: 'Check your business email address is correct before submitting',
        metaDescription: 'Check the email address for your business is correct.',
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
        const result = businessEmailCheckPresenter(data)

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
        const result = businessEmailCheckPresenter(data)

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
        const result = businessEmailCheckPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "businessEmail" property', () => {
    describe('when provided with a changed business email', () => {
      beforeEach(() => {
        data.changeBusinessEmail = 'new-email@new-email.com'
      })

      test('it should return the changed business email as the businessEmail', () => {
        const result = businessEmailCheckPresenter(data)

        expect(result.businessEmail).toEqual('new-email@new-email.com')
      })
    })
  })
})
