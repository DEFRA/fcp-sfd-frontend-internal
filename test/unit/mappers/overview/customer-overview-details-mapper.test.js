// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapCustomerOverviewDetails } from '../../../../src/mappers/overview/customer-overview-details-mapper.js'

describe('customer overview details mapper', () => {
  let rawData

  beforeEach(() => {
    rawData = {
      customer: {
        crn: '1234567890',
        info: {
          name: {
            first: 'Jane',
            last: 'Smith'
          }
        },
        businesses: [
          { name: 'Smith Farm', sbi: '123456789' },
          { name: 'Smith Orchard', sbi: '987654321' }
        ]
      }
    }
  })

  test('it maps all fields correctly', () => {
    const result = mapCustomerOverviewDetails(rawData)

    expect(result).toEqual({
      info: {
        crn: '1234567890',
        customerName: 'Jane Smith'
      },
      businesses: [
        { name: 'Smith Farm', sbi: '123456789' },
        { name: 'Smith Orchard', sbi: '987654321' }
      ]
    })
  })

  test('it concatenates first and last name into customerName', () => {
    rawData.customer.info.name.first = 'John'
    rawData.customer.info.name.last = 'Doe'

    const result = mapCustomerOverviewDetails(rawData)

    expect(result.info.customerName).toEqual('John Doe')
  })

  describe('when the name object is null', () => {
    beforeEach(() => {
      rawData.customer.info.name = null
    })

    test('it maps name fields to undefined without crashing', () => {
      const result = mapCustomerOverviewDetails(rawData)

      expect(result.info.customerName).toEqual('undefined undefined')
    })
  })

  describe('when the customer has no businesses', () => {
    beforeEach(() => {
      rawData.customer.businesses = null
    })

    test('it maps businesses as an empty array', () => {
      const result = mapCustomerOverviewDetails(rawData)

      expect(result.businesses).toEqual([])
    })
  })

  describe('when the businesses array is empty', () => {
    beforeEach(() => {
      rawData.customer.businesses = []
    })

    test('it maps businesses as an empty array', () => {
      const result = mapCustomerOverviewDetails(rawData)

      expect(result.businesses).toEqual([])
    })
  })

  describe('when a business is missing fields', () => {
    beforeEach(() => {
      rawData.customer.businesses = [{ name: null, sbi: null }]
    })

    test('it maps the missing fields as null', () => {
      const result = mapCustomerOverviewDetails(rawData)

      expect(result.businesses).toEqual([{ name: null, sbi: null }])
    })
  })
})
