// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessVatCheckPresenter } from '../../../../src/presenters/business/business-vat-check-presenter.js'

describe('businessVatCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789',
        vat: 'GB123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'

      }
    }
  })

  describe('when provided with business vat check data', () => {
    test('it correctly presents the data', () => {
      const result = businessVatCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-vat-change' },
        changeLink: '/business-vat-change',
        pageTitle: 'Check your VAT registration number is correct before submitting',
        metaDescription: 'Check the VAT registration number for your business is correct.',
        businessName: 'Agile Farm Ltd',
        sbi: '123456789',
        userName: 'Alfred Waldron',
        vatNumber: 'GB123456789'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessVatCheckPresenter(data)

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
        const result = businessVatCheckPresenter(data)

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
        const result = businessVatCheckPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "vatNumber" property', () => {
    describe('when provided with a changed vat number', () => {
      beforeEach(() => {
        data.vatNumber = 'GB987654321'
      })

      test('it should return the changed vat number as the vatNumber', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.vatNumber).toEqual('GB987654321')
      })
    })

    describe('when all vat sources are missing', () => {
      beforeEach(() => {
        delete data.info.vat
        delete data.vatNumber
      })

      test('it should return vatNumber as null', () => {
        const result = businessVatCheckPresenter(data)

        expect(result.vatNumber).toEqual(null)
      })
    })
  })
})
