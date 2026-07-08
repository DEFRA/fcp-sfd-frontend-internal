// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapBusinessDetails } from '../../../src/mappers/business-details-mapper.js'

describe('mapBusinessDetails', () => {
  let rawData

  beforeEach(() => {
    rawData = {
      business: {
        sbi: '106705779',
        info: {
          name: 'Herberts Lawn Mowing',
          vat: 'GB123456789',
          traderNumber: '123456',
          vendorNumber: '654321',
          legalStatus: { type: 'Sole Proprietorship' },
          type: { type: 'Not Specified' },
          address: {
            buildingNumberRange: '7',
            street: 'Test Street',
            city: 'London',
            postalCode: 'SW1A 1AA',
            country: 'United Kingdom',
            line1: null,
            uprn: null
          },
          email: { address: 'test@example.com' },
          phone: { landline: '01234567890', mobile: '07700900000' }
        },
        countyParishHoldings: [{ cphNumber: '12/123/1234' }]
      }
    }
  })

  test('maps all fields correctly', () => {
    const result = mapBusinessDetails(rawData)

    expect(result.info.sbi).toBe('106705779')
    expect(result.info.businessName).toBe('Herberts Lawn Mowing')
    expect(result.info.vat).toBe('GB123456789')
    expect(result.info.traderNumber).toBe('123456')
    expect(result.info.vendorNumber).toBe('654321')
    expect(result.info.legalStatus).toBe('Sole Proprietorship')
    expect(result.info.type).toBe('Not Specified')
    expect(result.info.countyParishHoldingNumbers).toEqual([{ cphNumber: '12/123/1234' }])
    expect(result.contact.email).toBe('test@example.com')
    expect(result.contact.landline).toBe('01234567890')
    expect(result.contact.mobile).toBe('07700900000')
  })

  test('maps address using the engine address mapper', () => {
    const result = mapBusinessDetails(rawData)

    expect(result.address).toBeDefined()
  })

  test('does not include a customer property', () => {
    const result = mapBusinessDetails(rawData)

    expect(result.customer).toBeUndefined()
  })

  describe('when optional fields are absent', () => {
    beforeEach(() => {
      rawData.business.info.vat = null
      rawData.business.info.traderNumber = null
      rawData.business.info.vendorNumber = null
      rawData.business.info.legalStatus = null
      rawData.business.info.type = null
      rawData.business.info.email = null
      rawData.business.info.phone = null
      rawData.business.countyParishHoldings = null
    })

    test('maps null/absent optional fields defensively', () => {
      const result = mapBusinessDetails(rawData)

      expect(result.info.vat).toBeNull()
      expect(result.info.traderNumber).toBeNull()
      expect(result.info.vendorNumber).toBeNull()
      expect(result.info.legalStatus).toBeNull()
      expect(result.info.type).toBeNull()
      expect(result.info.countyParishHoldingNumbers).toEqual([])
      expect(result.contact.email).toBeNull()
      expect(result.contact.landline).toBeNull()
      expect(result.contact.mobile).toBeNull()
    })
  })

  describe('when the business name is missing', () => {
    beforeEach(() => {
      rawData.business.info.name = null
    })

    test('maps businessName as null', () => {
      const result = mapBusinessDetails(rawData)

      expect(result.info.businessName).toBeNull()
    })
  })
})
