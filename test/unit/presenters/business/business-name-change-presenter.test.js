// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessNameChangePresenter } from '../../../../src/presenters/business/business-name-change-presenter.js'

describe('businessNameChangePresenter', () => {
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

  describe('when provided with business name change data', () => {
    test('it correctly presents the data', () => {
      const result = businessNameChangePresenter(data, payload, referrer)

      expect(result).toEqual({
        backLink: { backLink: true, href: '/business/106705779/details' },
        pageTitle: 'What is your business name?',
        metaDescription: 'Update the name for your business.',
        userName: null,
        changeBusinessName: 'Herberts Lawn Mowing',
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
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/details' })
      })
    })

    describe('when there is no referrer', () => {
      test('it falls back to the sbi details page', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/details' })
      })
    })

    describe('when there is no referrer and the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.backLink).toEqual({ backLink: true, href: '/search-sbi' })
      })
    })
  })

  describe('the "changeBusinessName" property', () => {
    describe('when there is no change or payload', () => {
      test('it uses the current business name', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.changeBusinessName).toBe('Herberts Lawn Mowing')
      })
    })

    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessName = 'New Farm Name'
      })

      test('it prefers the in-progress change over the current name', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.changeBusinessName).toBe('New Farm Name')
      })
    })

    describe('when there is a submitted payload', () => {
      beforeEach(() => {
        data.changeBusinessName = 'New Farm Name'
        payload = 'Payload Farm Name'
      })

      test('it prefers the submitted payload over everything else', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.changeBusinessName).toBe('Payload Farm Name')
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when a customer is present', () => {
      beforeEach(() => {
        data.customer = { userName: 'Jane Doe' }
      })

      test('it returns the userName', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.userName).toBe('Jane Doe')
      })
    })

    describe('when there is no customer', () => {
      test('it defaults the userName to null', () => {
        const result = businessNameChangePresenter(data, payload, referrer)

        expect(result.userName).toBeNull()
      })
    })
  })

  describe('the "businessName" and "sbi" properties', () => {
    test('it exposes the business name and sbi', () => {
      const result = businessNameChangePresenter(data, payload, referrer)

      expect(result.businessName).toBe('Herberts Lawn Mowing')
      expect(result.sbi).toBe('106705779')
    })
  })
})
