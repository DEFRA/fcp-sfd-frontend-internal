// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessVatChangePresenter } from '../../../../src/presenters/business/business-vat-change-presenter.js'

describe('businessVatChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: {
        sbi: '123456789',
        vat: 'GB123456789'
      },
      contact: {
        email: 'test@test.com'
      }
    }
  })

  describe('when provided with business vat change data', () => {
    test('it correctly presents the data', () => {
      const result = businessVatChangePresenter(data)

      expect(result).toEqual({
        backLink: { backLink: true, href: '/business/123456789/details' },
        pageTitle: 'What is your VAT registration number?',
        metaDescription: 'Update the VAT registration number for your business.',
        sbi: '123456789',
        vatNumber: 'GB123456789'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when a same-origin referrer is provided', () => {
      test('it returns the referrer path', () => {
        const result = businessVatChangePresenter(data, undefined, 'https://example.com/business/123456789/details')

        expect(result.backLink).toEqual({ backLink: true, href: '/business/123456789/details' })
      })
    })

    describe('when the sbi is missing and there is no referrer', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it falls back to the search page', () => {
        const result = businessVatChangePresenter(data)

        expect(result.backLink).toEqual({ backLink: true, href: '/search-sbi' })
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessVatChangePresenter(data)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "vat number" property', () => {
    describe('when provided with a changed vat number', () => {
      beforeEach(() => {
        data.changeBusinessVat = 'GB987654321'
      })

      test('it should return the changed vatNumber as the vatNumber', () => {
        const result = businessVatChangePresenter(data)

        expect(result.vatNumber).toEqual('GB987654321')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = 'GB876543219'
      })

      test('it should return the payload as the vatNumber', () => {
        const result = businessVatChangePresenter(data, payload)

        expect(result.vatNumber).toEqual('GB876543219')
      })
    })
  })
})
