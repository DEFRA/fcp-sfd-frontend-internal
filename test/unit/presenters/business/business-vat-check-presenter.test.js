// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessVatCheckPresenter } from '../../../../src/presenters/business/business-vat-check-presenter.js'

describe('businessVatCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        sbi: '123456789',
        vat: 'GB123456789'
      }
    }
  })

  describe('when provided with business vat check data', () => {
    test('it correctly presents the data', () => {
      const result = businessVatCheckPresenter(data)

      expect(result).toEqual({
        backLink: '/business/123456789/business-vat-registration-number-change',
        changeLink: '/business/123456789/business-vat-registration-number-change',
        pageTitle: 'Check your VAT registration number is correct before submitting',
        metaDescription: 'Check the VAT registration number for your business is correct.',
        sbi: '123456789',
        vatNumber: 'GB123456789'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the sbi is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.backLink).toEqual('/search-sbi')
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "vatNumber" property', () => {
    describe('when provided with a changed vat number', () => {
      beforeEach(() => {
        data.changeBusinessVat = 'GB987654321'
      })

      test('it should return the changed vat number as the vatNumber', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.vatNumber).toEqual('GB987654321')
      })
    })

    describe('when there is no changed vat number and none held against the business', () => {
      beforeEach(() => {
        delete data.info.vat
      })

      test('it should return vatNumber as null', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.vatNumber).toEqual(null)
      })
    })
  })
})
