// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessAddressEnterPresenter } from '../../../../src/presenters/business/business-address-enter-presenter.js'

describe('businessAddressEnterPresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      },
      address: {
        manual: {
          line1: '10 Skirbeck Way',
          line2: 'Lonely Lane',
          line4: 'Maidstone',
          line5: 'Somerset'
        },
        postcode: 'SK22 1DL',
        country: 'United Kingdom'
      }
    }
  })

  describe('when provided with business address enter data', () => {
    test('it correctly presents the data', () => {
      const result = businessAddressEnterPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'Enter your business address',
        metaDescription: 'Enter the address for your business.',
        address: {
          address1: '10 Skirbeck Way',
          address2: 'Lonely Lane',
          city: 'Maidstone',
          country: 'United Kingdom',
          county: 'Somerset',
          postcode: 'SK22 1DL'
        },
        businessName: 'Agile Farm Ltd',
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
        const result = businessAddressEnterPresenter(data)

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
        const result = businessAddressEnterPresenter(data)

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
        const result = businessAddressEnterPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "address" property', () => {
    describe('when provided with a changed business address', () => {
      beforeEach(() => {
        data.changeBusinessAddress = {
          address1: 'A different address',
          city: 'Maidstone',
          county: 'A new county',
          postcode: 'BA123 ABC',
          country: 'United Kingdom'
        }
      })

      test('it should return the changed address as the address', () => {
        const result = businessAddressEnterPresenter(data)

        expect(result.address).toEqual(data.changeBusinessAddress)
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = {
          address1: 'A new new address',
          city: 'New Address City',
          county: 'A new new county',
          postcode: 'BA123 NEW',
          country: 'United Kingdom'
        }
      })

      test('it should return the changed address as the address', () => {
        const result = businessAddressEnterPresenter(data, payload)

        expect(result.address).toEqual(payload)
      })
    })

    describe('when no existing address is provided', () => {
      beforeEach(() => {
        delete data.address.manual.line1
        delete data.address.manual.line2
        delete data.address.manual.line4
        delete data.address.manual.line5
        delete data.address.postcode
        delete data.address.country
      })

      test('it should return the address fields as null', () => {
        const result = businessAddressEnterPresenter(data)

        expect(result.address).toEqual({
          address1: null,
          address2: null,
          city: null,
          county: null,
          country: null,
          postcode: null
        })
      })
    })
  })
})
