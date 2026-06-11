// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Test helpers
import { getMappedData } from '../../../mocks/mock-business-details-by-sbi.js'

// Thing under test
import { searchSbiPresenter } from '../../../../src/presenters/search/search-sbi-presenter.js'

describe('searchSbiPresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = getMappedData()

    payload = '106705779'
  })

  describe('when provided with business details and payload', () => {
    test('it correctly presents the data', () => {
      const result = searchSbiPresenter(data, payload)

      expect(result).toEqual({
        businessName: 'Herberts Lawn Mowing',
        businessTraderNumber: '876432',
        businessVendorNumber: '673920',
        businessAddress: 'Herberts Lawn Mowing Ltd, Flat 2, The Lawn Building, 14 Chip Lane, Chip Lane Area, Taunton Borough, Taunton, Somerset, England',
        businessPostcode: 'TA1 1AA',
        businessOverviewLink: '/business-overview?sbi=106705779',
        clearSearchLink: '/search-sbi',
        resultText: '1 result for "106705779"',
        showResults: true,
        showBusinessDetails: true,
        showClear: true,
        sbi: '106705779'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessName).toEqual('')
      })
    })
  })

  describe('the "businessTraderNumber" property', () => {
    describe('when the traderNumber property is missing', () => {
      beforeEach(() => {
        delete data.info.traderNumber
      })

      test('it should return businessTraderNumber as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessTraderNumber).toEqual('')
      })
    })
  })

  describe('the "businessVendorNumber" property', () => {
    describe('when the vendorNumber property is missing', () => {
      beforeEach(() => {
        delete data.info.vendorNumber
      })

      test('it should return businessVendorNumber as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessVendorNumber).toEqual('')
      })
    })
  })

  describe('the "businessAddress" property', () => {
    describe('when the address is manually entered', () => {
      beforeEach(() => {
        data.address.lookup.uprn = null
      })

      test('it should build the address from manual fields', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessAddress).toEqual('14 Chip Lane, Taunton Sorting Office, Taunton, Somerset, England')
      })
    })

    describe('when the address is missing', () => {
      beforeEach(() => {
        delete data.address
      })

      test('it should return businessAddress as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessAddress).toEqual('')
      })
    })
  })

  describe('the "businessPostcode" property', () => {
    describe('when the address is missing', () => {
      beforeEach(() => {
        delete data.address
      })

      test('it should return businessPostcode as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessPostcode).toEqual('')
      })
    })
  })

  describe('the "showBusinessDetails" property', () => {
    describe('when business details are missing', () => {
      beforeEach(() => {
        data = null
      })

      test('it should return showBusinessDetails as false', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.showBusinessDetails).toEqual(false)
      })
    })
  })

  describe('the "resultText" property', () => {
    describe('when business details are missing', () => {
      beforeEach(() => {
        data = null
      })

      test('it should return 0 results', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.resultText).toEqual('0 results for "106705779"')
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when payload is missing', () => {
      beforeEach(() => {
        payload = null
      })

      test('it should return sbi as an empty string', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.sbi).toEqual('')
      })
    })
  })

  describe('the "businessOverviewLink" property', () => {
    describe('when payload is missing', () => {
      beforeEach(() => {
        payload = null
      })

      test('it should return the link with an empty sbi', () => {
        const result = searchSbiPresenter(data, payload)

        expect(result.businessOverviewLink).toBe('/business-overview?sbi=')
      })
    })
  })
})
