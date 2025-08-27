// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { addressPresenter } from '../../../src/presenters/address-presenter.js'
describe('address presenter', () => {
  describe('#formatAddress', () => {
    let address

    beforeEach(async () => {
      address = {
        lookup: {
          flatName: 'THE COACH HOUSE',
          buildingNumberRange: '7',
          buildingName: 'STOCKWELL HALL',
          street: 'HAREWOOD AVENUE',
          city: 'DARLINGTON',
          county: 'Dorset'
        },
        manual: {
          line1: '76 Robinswood Road',
          line2: 'UPPER CHUTE',
          line3: 'Child Okeford',
          line4: null,
          line5: null
        },
        postcode: 'CO9 3LS',
        country: 'United Kingdom'
      }
    })

    describe('when the address has line properties and named properties', () => {
      test('it should use the named properties ', () => {
        const result = addressPresenter.formatAddress(address)

        expect(result).toStrictEqual([
          'THE COACH HOUSE',
          'STOCKWELL HALL',
          '7 HAREWOOD AVENUE',
          'DARLINGTON',
          'Dorset',
          'CO9 3LS',
          'United Kingdom'
        ])
      })
    })

    describe('when the named properties include a building number', () => {
      test('it should prefix the street with the number', () => {
        const result = addressPresenter.formatAddress(address)

        expect(result).toStrictEqual([
          'THE COACH HOUSE',
          'STOCKWELL HALL',
          '7 HAREWOOD AVENUE',
          'DARLINGTON',
          'Dorset',
          'CO9 3LS',
          'United Kingdom'
        ])
      })
    })

    describe('when the named properties does not have a building number', () => {
      test('it should leave the street property unchanged', () => {
        address.lookup.buildingNumberRange = null
        const result = addressPresenter.formatAddress(address)

        expect(result).toStrictEqual([
          'THE COACH HOUSE',
          'STOCKWELL HALL',
          'HAREWOOD AVENUE',
          'DARLINGTON',
          'Dorset',
          'CO9 3LS',
          'United Kingdom'
        ])
      })
    })

    describe('when the address has no named properties', () => {
      test('it should use the lined properties ', () => {
        address.lookup.flatName = null
        address.lookup.buildingNumberRange = null
        address.lookup.buildingName = null
        address.lookup.street = null
        address.lookup.city = null
        address.lookup.county = null

        const result = addressPresenter.formatAddress(address)

        expect(result).toEqual([
          '76 Robinswood Road',
          'UPPER CHUTE',
          'Child Okeford',
          'CO9 3LS',
          'United Kingdom'
        ])
      })
    })
  })
})
