// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapBusinessOverviewDetails } from '../../../../src/mappers/overview/business-overview-details-mapper.js'

describe('business overview details mapper', () => {
  let rawData

  beforeEach(() => {
    rawData = {
      business: {
        sbi: '106705779',
        info: {
          name: 'Herberts Lawn Mowing'
        },
        customers: [
          { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' },
          { crn: '1100000002', firstName: 'Bob', lastName: 'Jones' }
        ]
      }
    }
  })

  test('it maps all fields correctly', () => {
    const result = mapBusinessOverviewDetails(rawData)

    expect(result).toEqual({
      sbi: '106705779',
      businessName: 'Herberts Lawn Mowing',
      customers: [
        { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' },
        { crn: '1100000002', firstName: 'Bob', lastName: 'Jones' }
      ]
    })
  })

  describe('when the customers array is empty', () => {
    beforeEach(() => {
      rawData.business.customers = []
    })

    test('it maps customers as an empty array', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.customers).toEqual([])
    })
  })

  describe('when customers is null', () => {
    beforeEach(() => {
      rawData.business.customers = null
    })

    test('it maps customers as an empty array', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.customers).toEqual([])
    })
  })

  describe('when a customer is missing fields', () => {
    beforeEach(() => {
      rawData.business.customers = [{ crn: null, firstName: null, lastName: null }]
    })

    test('it maps the missing fields as null', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.customers).toEqual([{ crn: null, firstName: null, lastName: null }])
    })
  })

  describe('when the business name is missing', () => {
    beforeEach(() => {
      delete rawData.business.info.name
    })

    test('it maps businessName as null', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.businessName).toBeNull()
    })
  })

  describe('when info is missing', () => {
    beforeEach(() => {
      delete rawData.business.info
    })

    test('it maps businessName as null', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.businessName).toBeNull()
    })
  })

  describe('when sbi is missing', () => {
    beforeEach(() => {
      delete rawData.business.sbi
    })

    test('it maps sbi as null', () => {
      const result = mapBusinessOverviewDetails(rawData)

      expect(result.sbi).toBeNull()
    })
  })
})
