// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailCheckPresenter } from '../../../../src/presenters/business/business-email-check-presenter.js'

describe('businessEmailCheckPresenter', () => {
  let data
  let referrer

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      contact: { email: 'test@example.com' }
    }
    referrer = undefined
  })

  describe('when provided with business email check data', () => {
    test('it correctly presents the data', () => {
      const result = businessEmailCheckPresenter(data, referrer)

      expect(result).toEqual({
        backLink: { backLink: true, href: '/business/106705779/business-email-change' },
        changeLink: '/business/106705779/business-email-change',
        pageTitle: 'Check your business email address is correct before submitting',
        metaDescription: 'Check the email address for your business is correct.',
        userName: null,
        businessEmail: 'test@example.com',
        businessName: 'Herberts Lawn Mowing',
        sbi: '106705779'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the referrer is a valid url', () => {
      beforeEach(() => {
        referrer = 'https://example.com/business/106705779/business-email-change'
      })

      test('it builds the back link from the referrer', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/business-email-change' })
      })
    })

    describe('when there is no referrer', () => {
      test('it falls back to the business email change page', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/business-email-change' })
      })
    })

    describe('when there is no referrer and the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/search-sbi' })
      })
    })
  })

  describe('the "businessEmail" property', () => {
    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessEmail = 'changed@example.com'
      })

      test('it uses the in-progress change email', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.businessEmail).toBe('changed@example.com')
      })
    })

    describe('when there is no in-progress change', () => {
      test('it falls back to the current business email', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.businessEmail).toBe('test@example.com')
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when a customer is present', () => {
      beforeEach(() => {
        data.customer = { userName: 'Jane Doe' }
      })

      test('it returns the userName', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.userName).toBe('Jane Doe')
      })
    })

    describe('when there is no customer', () => {
      test('it defaults the userName to null', () => {
        const result = businessEmailCheckPresenter(data, referrer)

        expect(result.userName).toBeNull()
      })
    })
  })

  describe('the "businessName" and "sbi" properties', () => {
    test('it exposes the business name and sbi', () => {
      const result = businessEmailCheckPresenter(data, referrer)

      expect(result.businessName).toBe('Herberts Lawn Mowing')
      expect(result.sbi).toBe('106705779')
    })
  })
})
