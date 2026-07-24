// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailChangePresenter } from '../../../../src/presenters/business/business-email-change-presenter.js'

describe('businessEmailChangePresenter', () => {
  let data
  let payload
  let referrer

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      contact: { email: 'test@example.com' }
    }
    payload = undefined
    referrer = undefined
  })

  describe('when provided with business email change data', () => {
    test('it correctly presents the data', () => {
      const result = businessEmailChangePresenter(data, payload, referrer)

      expect(result).toEqual({
        backLink: { backLink: true, href: '/business/106705779/details' },
        pageTitle: 'What is your business email address?',
        metaDescription: 'Update the email address for your business.',
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
        referrer = 'https://example.com/business/106705779/details'
      })

      test('it builds the back link from the referrer', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/details' })
      })
    })

    describe('when there is no referrer', () => {
      test('it falls back to the sbi details page', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/details' })
      })
    })

    describe('when there is no referrer and the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/search-sbi' })
      })
    })
  })

  describe('the "businessEmail" property', () => {
    describe('when there is no change or payload', () => {
      test('it uses the current business email', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.businessEmail).toBe('test@example.com')
      })
    })

    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessEmail = 'changed@example.com'
      })

      test('it prefers the in-progress change over the current email', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.businessEmail).toBe('changed@example.com')
      })
    })

    describe('when there is a submitted payload', () => {
      beforeEach(() => {
        data.changeBusinessEmail = 'changed@example.com'
        payload = 'payload@example.com'
      })

      test('it prefers the submitted payload over everything else', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.businessEmail).toBe('payload@example.com')
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when a customer is present', () => {
      beforeEach(() => {
        data.customer = { userName: 'Jane Doe' }
      })

      test('it returns the userName', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.userName).toBe('Jane Doe')
      })
    })

    describe('when there is no customer', () => {
      test('it defaults the userName to null', () => {
        const result = businessEmailChangePresenter(data, payload, referrer)

        expect(result.userName).toBeNull()
      })
    })
  })

  describe('the "businessName" and "sbi" properties', () => {
    test('it exposes the business name and sbi', () => {
      const result = businessEmailChangePresenter(data, payload, referrer)

      expect(result.businessName).toBe('Herberts Lawn Mowing')
      expect(result.sbi).toBe('106705779')
    })
  })
})
