// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { businessNameCheckPresenter } from '../../../../src/presenters/business/business-name-check-presenter.js'

describe('businessNameCheckPresenter', () => {
  let data

  beforeEach(() => {
    vi.clearAllMocks()

    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      }
    }
  })

  describe('when called with complete data', () => {
    test('it correctly returns the data', () => {
      const result = businessNameCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-name-change' },
        changeLink: '/business-name-change',
        pageTitle: 'Check your business name is correct before submitting',
        metaDescription: 'Check the name for your business is correct.',
        businessName: 'Agile Farm Ltd',
        changeBusinessName: 'Agile Farm Ltd',
        sbi: '123456789',
        userName: 'Alfred Waldron'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.businessName).toEqual(null)
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessNameCheckPresenter(data)

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
        const result = businessNameCheckPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "changeBusinessName" property', () => {
    describe('when the changeBusinessName property is missing', () => {
      beforeEach(() => {
        delete data.changeBusinessName
      })

      test('it should fallback to businessName value', () => {
        const result = businessNameCheckPresenter(data)

        expect(result.changeBusinessName).toEqual('Agile Farm Ltd')
      })
    })
  })
})
