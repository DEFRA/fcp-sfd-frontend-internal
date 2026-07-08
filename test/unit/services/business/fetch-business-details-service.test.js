// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'
import Boom from '@hapi/boom'

// Things we need to mock
import { businessDetailsQuery } from '../../../../src/dal/queries/business-details.js'

// Mock dependencies
const mockMapBusinessDetails = vi.fn()
const mockDalConnector = { query: vi.fn() }

vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/business-details-mapper.js', () => ({
  mapBusinessDetails: mockMapBusinessDetails
}))

// Thing under test
const { fetchBusinessDetailsService } = await import('../../../../src/services/business/fetch-business-details-service.js')

describe('fetchBusinessDetailsService', () => {
  let sbi
  let email
  let dalData
  let mappedData

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '106705779'
    email = 'test.user@defra.gov.uk'

    dalData = {
      business: {
        sbi: '106705779',
        info: {
          name: 'Herberts Lawn Mowing',
          vat: 'GB123456789',
          traderNumber: '123456',
          vendorNumber: '654321',
          legalStatus: { type: 'Sole Proprietorship' },
          type: { type: 'Not Specified' },
          address: {},
          email: { address: 'test@example.com' },
          phone: { landline: '01234567890', mobile: null }
        },
        countyParishHoldings: []
      }
    }

    mappedData = {
      info: {
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        vat: 'GB123456789',
        traderNumber: '123456',
        vendorNumber: '654321',
        legalStatus: 'Sole Proprietorship',
        type: 'Not Specified',
        countyParishHoldingNumbers: []
      },
      address: {},
      contact: {
        email: 'test@example.com',
        landline: '01234567890',
        mobile: null
      }
    }
  })

  describe('when DAL returns data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMapBusinessDetails.mockReturnValue(mappedData)
    })

    test('should call DAL connector with businessDetailsQuery and sbi', async () => {
      await fetchBusinessDetailsService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        businessDetailsQuery,
        { sbi },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchBusinessDetailsService(sbi, email)

      expect(mockMapBusinessDetails).toHaveBeenCalledWith(dalData)
      expect(result).toEqual(mappedData)
    })
  })

  describe('when the DAL returns no data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: null })
    })

    test('should throw Boom.notFound error', async () => {
      await expect(fetchBusinessDetailsService(sbi, email)).rejects.toThrow(Boom.notFound('Business not found'))

      expect(mockMapBusinessDetails).not.toHaveBeenCalled()
    })
  })
})
