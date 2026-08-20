// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessVatRemovePresenter } from '../../../../src/presenters/business/business-vat-remove-presenter.js'

describe('businessVatRemovePresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        sbi: '123456789',
        vat: 'GB123456789'
      }
    }
  })

  describe('when provided with business vat remove data', () => {
    test('it correctly presents the data', () => {
      const result = businessVatRemovePresenter(data)

      expect(result).toEqual({
        backLink: { backLink: true, href: '/business/123456789/details' },
        pageTitle: 'Are you sure you want to remove your VAT registration number?',
        metaDescription: 'Are you sure you want to remove your VAT registration number?',
        vatNumber: 'GB123456789',
        sbi: '123456789',
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessVatRemovePresenter(data)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "vatNumber" property', () => {
    describe('when the vat property is missing', () => {
      beforeEach(() => {
        delete data.info.vat
      })

      test('it should return vatNumber as null', () => {
        const result = businessVatRemovePresenter(data)

        expect(result.vatNumber).toEqual(null)
      })
    })

    describe('when the vat property is null', () => {
      beforeEach(() => {
        data.info.vat = null
      })

      test('it should return vatNumber as null', () => {
        const result = businessVatRemovePresenter(data)

        expect(result.vatNumber).toEqual(null)
      })
    })
  })
})
