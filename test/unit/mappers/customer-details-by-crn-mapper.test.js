// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapCustomerDetailsByCrn } from '../../../src/mappers/customer-details-by-crn-mapper.js'

// Test helpers
import { getDalData, getMappedData } from '../../mocks/mock-customer-details-by-crn.js'

describe('customer details by CRN mapper', () => {
  let rawData

  beforeEach(() => {
    rawData = getDalData()
  })

  test('it maps all fields correctly', () => {
    const result = mapCustomerDetailsByCrn(rawData)

    expect(result).toEqual(getMappedData())
  })

  test('it concatenates first and last name into customerName', () => {
    rawData.customer.info.name.first = 'John'
    rawData.customer.info.name.last = 'Doe'

    const result = mapCustomerDetailsByCrn(rawData)

    expect(result.info.customerName).toEqual('John Doe')
  })

  describe('when the address has no lookup fields', () => {
    beforeEach(() => {
      rawData.customer.info.address.buildingNumberRange = null
      rawData.customer.info.address.flatName = null
      rawData.customer.info.address.buildingName = null
      rawData.customer.info.address.dependentLocality = null
      rawData.customer.info.address.doubleDependentLocality = null
      rawData.customer.info.address.street = null
      rawData.customer.info.address.county = null
      rawData.customer.info.address.uprn = null
    })

    test('it maps all lookup fields as null', () => {
      const result = mapCustomerDetailsByCrn(rawData)

      expect(result.address.lookup).toEqual({
        buildingNumberRange: null,
        flatName: null,
        buildingName: null,
        dependentLocality: null,
        doubleDependentLocality: null,
        street: null,
        county: null,
        uprn: null
      })
    })
  })

  describe('when the address uses manual entry only', () => {
    beforeEach(() => {
      rawData.customer.info.address.uprn = null
      rawData.customer.info.address.line1 = '12 Farm Lane'
      rawData.customer.info.address.line2 = null
      rawData.customer.info.address.line3 = null
      rawData.customer.info.address.line4 = null
      rawData.customer.info.address.line5 = null
    })

    test('it maps manual address fields correctly', () => {
      const result = mapCustomerDetailsByCrn(rawData)

      expect(result.address.manual).toEqual({
        line1: '12 Farm Lane',
        line2: null,
        line3: null,
        line4: null,
        line5: null
      })
    })
  })

  describe('when the postalCode field is used for postcode', () => {
    beforeEach(() => {
      rawData.customer.info.address.postalCode = 'EX1 2AB'
    })

    test('it maps postalCode to postcode', () => {
      const result = mapCustomerDetailsByCrn(rawData)

      expect(result.address.postcode).toEqual('EX1 2AB')
    })
  })

  describe('when the address object is null', () => {
    beforeEach(() => {
      rawData.customer.info.address = null
    })

    test('it maps all address fields to null without crashing', () => {
      const result = mapCustomerDetailsByCrn(rawData)

      expect(result.address.lookup).toEqual({
        buildingNumberRange: undefined,
        flatName: undefined,
        buildingName: undefined,
        dependentLocality: undefined,
        doubleDependentLocality: undefined,
        street: undefined,
        county: undefined,
        uprn: undefined
      })
      expect(result.address.manual).toEqual({
        line1: undefined,
        line2: undefined,
        line3: undefined,
        line4: undefined,
        line5: undefined
      })
      expect(result.address.city).toEqual(undefined)
      expect(result.address.postcode).toEqual(undefined)
      expect(result.address.country).toEqual(undefined)
    })
  })
})
