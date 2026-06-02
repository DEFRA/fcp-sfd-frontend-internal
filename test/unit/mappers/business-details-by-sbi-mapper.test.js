// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapBusinessDetailsBySbi } from '../../../src/mappers/business-details-by-sbi-mapper.js'

// Test helpers
import { getDalData, getMappedData } from '../../mocks/mock-business-details-by-sbi.js'

describe('business details by SBI mapper', () => {
  let rawData

  beforeEach(() => {
    rawData = getDalData()
  })

  test('it maps all fields correctly', () => {
    const result = mapBusinessDetailsBySbi(rawData)

    expect(result).toEqual(getMappedData())
  })

  describe('when the business has no trader number', () => {
    beforeEach(() => {
      rawData.business.info.traderNumber = null
    })

    test('it maps trader number as null', () => {
      const result = mapBusinessDetailsBySbi(rawData)

      expect(result.info.traderNumber).toEqual(null)
    })
  })

  describe('when the business has no vendor number', () => {
    beforeEach(() => {
      rawData.business.info.vendorNumber = null
    })

    test('it maps vendor number as null', () => {
      const result = mapBusinessDetailsBySbi(rawData)

      expect(result.info.vendorNumber).toEqual(null)
    })
  })

  describe('when the address has no lookup fields', () => {
    beforeEach(() => {
      rawData.business.info.address.pafOrganisationName = null
      rawData.business.info.address.buildingNumberRange = null
      rawData.business.info.address.flatName = null
      rawData.business.info.address.buildingName = null
      rawData.business.info.address.dependentLocality = null
      rawData.business.info.address.doubleDependentLocality = null
      rawData.business.info.address.street = null
      rawData.business.info.address.county = null
      rawData.business.info.address.uprn = null
    })

    test('it maps all lookup fields as null', () => {
      const result = mapBusinessDetailsBySbi(rawData)

      expect(result.address.lookup).toEqual({
        pafOrganisationName: null,
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
      rawData.business.info.address.uprn = null
      rawData.business.info.address.line1 = '14 Chip Lane'
      rawData.business.info.address.line2 = null
      rawData.business.info.address.line3 = null
      rawData.business.info.address.line4 = null
      rawData.business.info.address.line5 = null
    })

    test('it maps manual address fields correctly', () => {
      const result = mapBusinessDetailsBySbi(rawData)

      expect(result.address.manual).toEqual({
        line1: '14 Chip Lane',
        line2: null,
        line3: null,
        line4: null,
        line5: null
      })
    })
  })

  describe('when the postalCode field is used for postcode', () => {
    beforeEach(() => {
      rawData.business.info.address.postalCode = 'EX1 2AB'
    })

    test('it maps postalCode to postcode', () => {
      const result = mapBusinessDetailsBySbi(rawData)

      expect(result.address.postcode).toEqual('EX1 2AB')
    })
  })
})
