// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessNameCheckPresenter } from '../../../../src/presenters/business/business-name-check-presenter.js'

describe('businessNameCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' }
    }
  })

  describe('when provided with business name check data', () => {
    test('it correctly presents the data', () => {
      const result = businessNameCheckPresenter(data)

      expect(result).toEqual({
        backLink: '/business/106705779/business-name-change',
        changeLink: '/business/106705779/business-name-change',
        pageTitle: 'Check your business name is correct before submitting',
        metaDescription: 'Check the name for your business is correct.',
        userName: null,
        businessName: 'Herberts Lawn Mowing',
        sbi: '106705779'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the sbi is present', () => {
      test('it returns the business name change page', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.backLink).toEqual('/business/106705779/business-name-change')
      })
    })

    describe('when the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.backLink).toEqual('/search-sbi')
        expect(result.changeLink).toBe('/search-sbi')
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when there is an in-progress change', () => {
      beforeEach(() => {
        data.changeBusinessName = 'New Farm Ltd'
      })

      test('it uses the in-progress change name', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.businessName).toBe('New Farm Ltd')
      })
    })

    describe('when there is no in-progress change', () => {
      test('it falls back to the current business name', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.businessName).toBe('Herberts Lawn Mowing')
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when a customer is present', () => {
      beforeEach(() => {
        data.customer = { userName: 'Jane Doe' }
      })

      test('it returns the userName', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.userName).toBe('Jane Doe')
      })
    })

    describe('when there is no customer', () => {
      test('it defaults the userName to null', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.userName).toBeNull()
      })
    })
  })

  describe('when the "info" object is missing', () => {
    beforeEach(() => {
      data = {}
    })

    test('it defaults businessName and sbi to null and falls back to the search page', () => {
      const result = businessNameCheckPresenter(data)

      expect(result.businessName).toBeNull()
      expect(result.sbi).toBeNull()
      expect(result.backLink).toEqual('/search-sbi')
      expect(result.changeLink).toBe('/search-sbi')
    })
  })
})
