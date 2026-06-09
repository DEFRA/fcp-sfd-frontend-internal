// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Test helpers
import { getMappedData, getPresentedData } from '../../../mocks/mock-business-overview.js'

// Thing under test
import { businessOverviewPresenter } from '../../../../src/presenters/business/business-overview-presenter.js'

describe('businessOverviewPresenter', () => {
  let data

  beforeEach(() => {
    data = getMappedData()
  })

  describe('when provided with business overview data', () => {
    test('it correctly presents the data', () => {
      const result = businessOverviewPresenter(data)

      expect(result).toEqual(getPresentedData())
    })
  })

  describe('the "searchResultsLink" property', () => {
    test('it returns the search results link', () => {
      const result = businessOverviewPresenter(data)
      expect(result.searchResultsLink).toBe('/search-sbi')
    })
  })

  describe('the "pageTitle" property', () => {
    test('it returns the correct page title', () => {
      const result = businessOverviewPresenter(data)

      expect(result.pageTitle).toBe('Business overview')
    })
  })

  describe('the "customers" property', () => {
    test('it builds full name from firstName and lastName', () => {
      const result = businessOverviewPresenter(data)

      expect(result.customers[0].name).toBe('Alice Smith')
    })

    describe('when a customer has no firstName', () => {
      beforeEach(() => {
        data.customers[0].firstName = null
      })

      test('it returns lastName only', () => {
        const result = businessOverviewPresenter(data)

        expect(result.customers[0].name).toBe('Smith')
      })
    })

    describe('when a customer has no lastName', () => {
      beforeEach(() => {
        data.customers[0].lastName = null
      })

      test('it returns firstName only', () => {
        const result = businessOverviewPresenter(data)

        expect(result.customers[0].name).toBe('Alice')
      })
    })

    describe('when customers array is empty', () => {
      beforeEach(() => {
        data.customers = []
      })

      test('it returns an empty array', () => {
        const result = businessOverviewPresenter(data)

        expect(result.customers).toEqual([])
      })
    })
  })
})
