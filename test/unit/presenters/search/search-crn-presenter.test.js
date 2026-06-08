// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Test helpers
import { getMappedData } from '../../../mocks/mock-customer-details-by-crn.js'

// Thing under test
import { searchCrnPresenter } from '../../../../src/presenters/search/search-crn-presenter.js'

describe('searchCrnPresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = getMappedData()

    payload = '1234567890'
  })

  describe('when provided with customer details and payload', () => {
    test('it correctly presents the data', () => {
      const result = searchCrnPresenter(data, payload)

      expect(result).toEqual({
        customerName: 'Jane Smith',
        customerAddress: 'Flat 1, The Farm House, 12 Farm Lane, Rural Area, West Fields, Exeter, Devon, England',
        customerPostcode: 'EX1 1AA',
        resultText: '1 result for "1234567890"',
        showResults: true,
        showCustomerDetails: true,
        showClear: true,
        crn: '1234567890'
      })
    })
  })

  describe('the "customerName" property', () => {
    describe('when the customerName property is missing', () => {
      beforeEach(() => {
        delete data.info.customerName
      })

      test('it should return customerName as an empty string', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.customerName).toEqual('')
      })
    })
  })

  describe('the "customerAddress" property', () => {
    describe('when the address is manually entered', () => {
      beforeEach(() => {
        data.address.lookup.uprn = null
      })

      test('it should build the address from manual fields', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.customerAddress).toEqual('12 Farm Lane, West Fields, Exeter, Devon, England')
      })
    })

    describe('when the address is missing', () => {
      beforeEach(() => {
        delete data.address
      })

      test('it should return customerAddress as an empty string', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.customerAddress).toEqual('')
      })
    })
  })

  describe('the "customerPostcode" property', () => {
    describe('when the address is missing', () => {
      beforeEach(() => {
        delete data.address
      })

      test('it should return customerPostcode as an empty string', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.customerPostcode).toEqual('')
      })
    })
  })

  describe('the "showCustomerDetails" property', () => {
    describe('when customer details are missing', () => {
      beforeEach(() => {
        data = null
      })

      test('it should return showCustomerDetails as false', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.showCustomerDetails).toEqual(false)
      })
    })
  })

  describe('the "resultText" property', () => {
    describe('when customer details are missing', () => {
      beforeEach(() => {
        data = null
      })

      test('it should return 0 results', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.resultText).toEqual('0 results for "1234567890"')
      })
    })
  })

  describe('the "crn" property', () => {
    describe('when payload is missing', () => {
      beforeEach(() => {
        payload = null
      })

      test('it should return crn as an empty string', () => {
        const result = searchCrnPresenter(data, payload)

        expect(result.crn).toEqual('')
      })
    })
  })
})
