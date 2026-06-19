// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { businessOverviewQuery } from '../../../../src/dal/queries/overview/business-details-overview.js'

// Test helpers
import { getDalData, getMappedData } from '../../../mocks/mock-business-overview.js'

// Mock dependencies
const mockMapBusinessOverview = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/overview/business-overview-details-mapper.js', () => ({
  mapBusinessOverview: mockMapBusinessOverview
}))

// Thing under test
const { fetchBusinessOverviewService } = await import('../../../../src/services/overview/fetch-business-overview-service.js')

describe('fetchBusinessOverviewService', () => {
  let sbi
  let email
  let dalData
  let mappedData

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '106705779'
    email = 'test.user@defra.gov.uk'

    dalData = getDalData()
    mappedData = getMappedData()
  })

  describe('when DAL returns data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMapBusinessOverview.mockReturnValue(mappedData)
    })

    test('should call DAL connector with businessOverviewQuery and sbi', async () => {
      await fetchBusinessOverviewService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        businessOverviewQuery,
        { sbi },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchBusinessOverviewService(sbi, email)

      expect(result).toEqual(mappedData)
    })

    test('should call mapper with DAL data', async () => {
      await fetchBusinessOverviewService(sbi, email)

      expect(mockMapBusinessOverview).toHaveBeenCalledWith(dalData)
    })
  })

  describe('when DAL returns no data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: null })
    })

    test('should throw an error', async () => {
      await expect(fetchBusinessOverviewService(sbi, email))
        .rejects.toThrow('Failed to retrieve business overview')
    })
  })

  describe('when DAL returns undefined data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({})
    })

    test('should throw an error', async () => {
      await expect(fetchBusinessOverviewService(sbi, email))
        .rejects.toThrow('Failed to retrieve business overview')
    })
  })
})
