// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessAddressSelectPresenter } from '../../../../src/presenters/business/business-address-select-presenter.js'

describe('businessAddressSelectPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789'
      },
      changeBusinessPostcode: {
        postcode: 'SK22 1DL'
      },
      changeBusinessAddresses: [
        {
          uprn: '100000111111',
          pafOrganisationName: null,
          buildingNumberRange: '18',
          flatName: 'Flat 3',
          buildingName: 'Fake Court',
          dependentLocality: null,
          doubleDependentLocality: null,
          street: 'Maple Road',
          county: 'Bristol',
          city: 'Westfield',
          postcode: 'BS1 4AB',
          country: 'United Kingdom'
        },
        {
          uprn: '100000111112',
          pafOrganisationName: null,
          buildingNumberRange: '20',
          flatName: 'Flat 5',
          buildingName: 'Fake Court',
          dependentLocality: null,
          doubleDependentLocality: null,
          street: 'Maple Road',
          county: 'Bristol',
          city: 'Westfield',
          postcode: 'BS1 4AB',
          country: 'United Kingdom'
        }
      ]
    }
  })

  describe('when provided with business address select data', () => {
    test('it correctly presents the data', () => {
      const result = businessAddressSelectPresenter(data)

      expect(result).toEqual({
        backLink: '/business/123456789/business-address-change',
        postcodeChangeLink: '/business/123456789/business-address-change',
        manualAddressLink: '/business/123456789/business-address-enter',
        pageTitle: 'Choose your business address',
        metaDescription: 'Choose the address for your business.',
        postcode: 'SK22 1DL',
        displayAddresses: expect.any(Array)
      })
    })
  })

  describe('the "displayAddresses" property', () => {
    test('it formats addresses as an array of objects with value and text', () => {
      const result = businessAddressSelectPresenter(data)

      expect(result.displayAddresses).toEqual(expect.arrayContaining([
        expect.objectContaining({
          value: expect.any(String),
          text: expect.any(String)
        })
      ]))
    })

    test('it includes both addresses from changeBusinessAddresses plus a summary item', () => {
      const result = businessAddressSelectPresenter(data)

      expect(result.displayAddresses).toHaveLength(3)
    })
  })

  describe('when there are no addresses', () => {
    beforeEach(() => {
      data.changeBusinessAddresses = []
    })

    test('it returns a summary item indicating no addresses found', () => {
      const result = businessAddressSelectPresenter(data)

      expect(result.displayAddresses).toHaveLength(1)
      expect(result.displayAddresses[0]).toEqual({
        selected: true,
        text: '0 addresses found',
        value: 'display'
      })
    })
  })

  describe('when there is no postcode', () => {
    beforeEach(() => {
      data.changeBusinessPostcode = undefined
    })

    test('it returns null for postcode', () => {
      const result = businessAddressSelectPresenter(data)

      expect(result.postcode).toBeNull()
    })
  })
})
