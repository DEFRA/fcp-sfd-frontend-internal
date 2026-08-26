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
      address: {
        lookup: {
          pafOrganisationName: null,
          buildingNumberRange: null,
          flatName: null,
          buildingName: null,
          dependentLocality: null,
          doubleDependentLocality: null,
          street: null,
          county: null,
          uprn: null
        },
        manual: {
          line1: '10 Skirbeck Way',
          line2: 'Lonely Lane',
          line3: null,
          line4: 'Somerset',
          line5: null
        },
        city: 'Maidstone',
        postcode: 'SK22 1DL',
        country: 'United Kingdom'
      }
    }
    payload = undefined
  })

  describe('when provided with business address enter data', () => {
    test('it correctly presents the data', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result).toEqual({
        backLink: '/business/123456789/business-address-change',
        pageTitle: 'Enter your business address',
        metaDescription: 'Enter the address for your business.',
        address: {
          line1: '10 Skirbeck Way',
          line2: 'Lonely Lane',
          line3: null,
          line4: 'Somerset',
          line5: null
        }
      })
    })
  })

  describe('when payload is provided', () => {
    beforeEach(() => {
      payload = {
        address1: '456 New Street',
        city: 'Manchester',
        postcode: 'M1 1AA',
        country: 'United Kingdom'
      }
    })

    test('it uses the payload instead of session data', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result.address).toEqual(payload)
    })
  })

  describe('when there is a pending changeBusinessAddress thats entered manually', () => {
    beforeEach(() => {
      data.changeBusinessAddress = {
        postcodeLookup: false,
        address1: 'A different address',
        city: 'Maidstone',
        county: 'A new county',
        postcode: 'BA123 ABC',
        country: 'United Kingdom'
      }
    })

    test('it should return the changed address as the address', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result.address).toEqual({
        postcodeLookup: false,
        address1: 'A different address',
        city: 'Maidstone',
        county: 'A new county',
        postcode: 'BA123 ABC',
        country: 'United Kingdom'
      })
    })
  })

  describe('when there is a pending changeBusinessAddress from postcode lookup', () => {
    beforeEach(() => {
      data.changeBusinessAddress = {
        postcodeLookup: true,
        uprn: '100000111111',
        displayAddress: 'Flat 3, Fake Court, 18, Maple Road, Westfield, Bristol, BS1 4AB',
        address1: 'A newer address',
        city: 'Maidstone nowhere',
        county: 'A new county',
        postcode: 'BA12 CBA',
        country: 'United Kingdom'
      }
    })

    test('it should return the changed address as the address', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result.address).toEqual({
        address1: null,
        address2: null,
        address3: null,
        city: 'Maidstone nowhere',
        county: 'A new county',
        postcode: 'BA12 CBA',
        country: 'United Kingdom'
      })
    })
  })

  describe('when there is no changeBusinessAddress', () => {
    beforeEach(() => {
      data.changeBusinessAddress = undefined
    })

    test('it falls back to the original address from the lookup', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result.address).toEqual({
        line1: '10 Skirbeck Way',
        line2: 'Lonely Lane',
        line3: null,
        line4: 'Somerset',
        line5: null
      })
    })
  })

  describe('when there is no address data at all', () => {
    beforeEach(() => {
      data.changeBusinessAddress = undefined
      data.address = undefined
    })

    test('it returns null for address', () => {
      const result = businessAddressEnterPresenter(data, payload)

      expect(result.address).toBeNull()
    })
  })
})
