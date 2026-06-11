// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { mapBusinessOverview } from '../../../src/mappers/business-overview-mapper.js'

// Test helpers
import { getDalData, getMappedData } from '../../mocks/mock-business-overview.js'

describe('business overview mapper', () => {
  let rawData

  beforeEach(() => {
    rawData = getDalData()
  })

  test('it maps all fields correctly', () => {
    const result = mapBusinessOverview(rawData)

    expect(result).toEqual(getMappedData())
  })

  describe('when business has no customers', () => {
    beforeEach(() => {
      rawData.business.customers = []
    })

    test('it returns an empty customers array', () => {
      const result = mapBusinessOverview(rawData)

      expect(result.customers).toEqual([])
    })
  })

  describe('when customers is null', () => {
    beforeEach(() => {
      rawData.business.customers = null
    })

    test('it returns an empty customers array', () => {
      const result = mapBusinessOverview(rawData)

      expect(result.customers).toEqual([])
    })
  })

  describe('when business name is missing', () => {
    beforeEach(() => {
      delete rawData.business.info.name
    })

    test('it returns businessName as null', () => {
      const result = mapBusinessOverview(rawData)

      expect(result.businessName).toBeNull()
    })
  })

  describe('when info is missing', () => {
    beforeEach(() => {
      delete rawData.business.info
    })

    test('it returns businessName as null', () => {
      const result = mapBusinessOverview(rawData)

      expect(result.businessName).toBeNull()
    })
  })
})
