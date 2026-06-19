// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { businessDetailsOverview } from '../../../../src/dal/queries/overview/business-details-overview.js'

// Mock dependencies
const mockMapBusinessOverviewDetails = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/overview/business-overview-details-mapper.js', () => ({
  mapBusinessOverviewDetails: mockMapBusinessOverviewDetails
}))

// Thing under test
const { fetchBusinessOverviewDetailsService } = await import('../../../../src/services/overview/fetch-business-overview-details-service.js')

describe('fetchBusinessOverviewDetailsService', () => {
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
        info: { name: 'Herberts Lawn Mowing' },
        customers: [
          { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' }
        ]
      }
    }

    mappedData = {
      sbi: '106705779',
      businessName: 'Herberts Lawn Mowing',
      customers: [
        { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' }
      ]
    }
  })

  describe('when DAL returns data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMapBusinessOverviewDetails.mockReturnValue(mappedData)
    })

    test('should call DAL connector with businessDetailsOverview and sbi', async () => {
      await fetchBusinessOverviewDetailsService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        businessDetailsOverview,
        { sbi },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchBusinessOverviewDetailsService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalled()
      expect(mockMapBusinessOverviewDetails).toHaveBeenCalledWith(dalData)
      expect(result).toEqual(mappedData)
    })
  })

  describe('when the DAL returns no data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: null })
    })

    test('should throw a generic error', async () => {
      await expect(fetchBusinessOverviewDetailsService(sbi, email)).rejects.toThrowError('Failed to retrieve business details')

      expect(mockMapBusinessOverviewDetails).not.toHaveBeenCalled()
    })
  })
})
