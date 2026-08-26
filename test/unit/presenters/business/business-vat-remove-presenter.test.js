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
        vat: 'GB123456789',
        businessName: 'Agile Farm Ltd'
      }
    }
  })

  describe('when provided with business vat remove data', () => {
    test('it correctly presents the data', () => {
      const result = businessVatRemovePresenter(data)

      expect(result).toEqual({
        backLink: '/business/123456789/details',
        pageTitle: 'Are you sure you want to remove your VAT registration number?',
        metaDescription: 'Are you sure you want to remove your VAT registration number?',
        businessName: 'Agile Farm Ltd',
        confirmRemove: null,
        vatNumber: 'GB123456789',
        sbi: '123456789'
      })
    })
  })

  describe('the "confirmRemove" property', () => {
    describe('when a payload value is provided', () => {
      test('it returns the payload value so the selection is replayed', () => {
        const result = businessVatRemovePresenter(data, 'no')

        expect(result.confirmRemove).toEqual('no')
      })
    })

    describe('when no payload value is provided', () => {
      test('it returns null', () => {
        const result = businessVatRemovePresenter(data)

        expect(result.confirmRemove).toEqual(null)
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

    describe('when there is a pending vat change in the session', () => {
      beforeEach(() => {
        data.changeBusinessVat = 'GB987654321'
      })

      test('it should still return the persisted vat number', () => {
        const result = businessVatRemovePresenter(data)

        expect(result.vatNumber).toEqual('GB123456789')
      })
    })
  })

  describe('when the "info" property is missing', () => {
    beforeEach(() => {
      delete data.info
    })

    test('it should not throw and should fall back to the search page', () => {
      const result = businessVatRemovePresenter(data)

      expect(result.backLink).toEqual('/search-sbi')
      expect(result.vatNumber).toEqual(null)
      expect(result.sbi).toEqual(null)
    })
  })
})
