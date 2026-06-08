// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { formatAddressLines } from '../../../src/presenters/base-presenter.js'

describe('basePresenter', () => {
  describe('#formatAddressLines', () => {
    let address

    describe('when the address is a lookup address with pafOrganisationName', () => {
      beforeEach(() => {
        address = {
          lookup: {
            pafOrganisationName: 'Herberts Lawn Mowing Ltd',
            flatName: 'Flat 2',
            buildingName: 'The Lawn Building',
            buildingNumberRange: '14',
            street: 'Chip Lane',
            doubleDependentLocality: 'Chip Lane Area',
            dependentLocality: 'Taunton Borough',
            county: 'Somerset',
            uprn: '100012345678'
          },
          manual: {},
          city: 'Taunton',
          postcode: 'TA1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines and postcode', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: 'Herberts Lawn Mowing Ltd, Flat 2, The Lawn Building, 14 Chip Lane, Chip Lane Area, Taunton Borough, Taunton, Somerset, England',
          postcode: 'TA1 1AA'
        })
      })
    })

    describe('when the address is a lookup address without pafOrganisationName', () => {
      beforeEach(() => {
        address = {
          lookup: {
            flatName: 'Flat 1',
            buildingName: 'The Farm House',
            buildingNumberRange: '12',
            street: 'Farm Lane',
            doubleDependentLocality: 'Rural Area',
            dependentLocality: 'West Fields',
            county: 'Devon',
            uprn: '200023456789'
          },
          manual: {},
          city: 'Exeter',
          postcode: 'EX1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines and postcode without an organisation name', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: 'Flat 1, The Farm House, 12 Farm Lane, Rural Area, West Fields, Exeter, Devon, England',
          postcode: 'EX1 1AA'
        })
      })
    })

    describe('when the address is manually entered', () => {
      beforeEach(() => {
        address = {
          lookup: { uprn: null },
          manual: {
            line1: '12 Farm Lane',
            line2: 'West Fields',
            line3: null,
            line4: 'Devon',
            line5: null
          },
          city: 'Exeter',
          postcode: 'EX1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines from manual fields', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: '12 Farm Lane, West Fields, Exeter, Devon, England',
          postcode: 'EX1 1AA'
        })
      })
    })

    describe('when the address is null', () => {
      test('it should return empty strings for both addressLines and postcode', () => {
        const result = formatAddressLines(null)

        expect(result).toEqual({
          addressLines: '',
          postcode: ''
        })
      })
    })

    describe('when the address is undefined', () => {
      test('it should return empty strings for both addressLines and postcode', () => {
        const result = formatAddressLines(undefined)

        expect(result).toEqual({
          addressLines: '',
          postcode: ''
        })
      })
    })

    describe('when some optional lookup fields are missing', () => {
      beforeEach(() => {
        address = {
          lookup: {
            buildingNumberRange: '10',
            street: 'Main Street',
            uprn: '300000000001'
          },
          manual: {},
          city: 'Bristol',
          postcode: 'BS1 1AA',
          country: 'England'
        }
      })

      test('it should omit the missing fields from the address lines', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: '10 Main Street, Bristol, England',
          postcode: 'BS1 1AA'
        })
      })
    })
  })
})
