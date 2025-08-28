// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessAddressCheckPresenter } from '../../../../src/presenters/business/business-address-check-presenter.js'

describe('businessAddressCheckPresenter', () => {
  let data

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
        address1: '10 Skirbeck Way',
        address2: 'Lonely Lane',
        city: 'Maidstone',
        county: 'Somerset',
        postcode: 'SK22 1DL',
        country: 'United Kingdom'
      }
    }
  })

  describe('when provided with business address check data', () => {
    test('it correctly presents the data', () => {
      const result = businessAddressCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-address-enter' },
        changeLink: '/business-address-enter',
        pageTitle: 'Check your business address is correct before submitting',
        metaDescription: 'Check the address for your business is correct.',
        address: [
          '10 Skirbeck Way',
          'Lonely Lane',
          'Maidstone',
          'Somerset',
          'SK22 1DL',
          'United Kingdom'
        ],
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
        const result = businessAddressCheckPresenter(data)

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
        const result = businessAddressCheckPresenter(data)

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
        const result = businessAddressCheckPresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "address" property', () => {
    describe('when provided with a changeBusinessAddress', () => {
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
        const result = businessAddressCheckPresenter(data)

        expect(result.address).toEqual([
          'A different address',
          'Maidstone',
          'A new county',
          'BA123 ABC',
          'United Kingdom'
        ])
      })
    })
  })
})
