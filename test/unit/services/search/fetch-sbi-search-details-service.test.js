// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { businessDetailsBySbi } from '../../../../src/dal/queries/business-details-by-sbi.js'

// Test helpers
import { getDalData, getMappedData } from '../../../mocks/mock-business-details-by-sbi.js'

// Mock dependencies
const mockMapBusinessDetailsBySbi = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/business-details-by-sbi-mapper.js', () => ({
  mapBusinessDetailsBySbi: mockMapBusinessDetailsBySbi
}))

// Thing under test
const { fetchSbiSearchDetailsService } = await import('../../../../src/services/search/fetch-sbi-search-details-service.js')

describe('fetchSbiSearchDetailsService', () => {
  let sbi
  let email
  let dalData
  let mappedData

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '106705779'
    email = 'test.farmer@test.farm.com'

    dalData = getDalData()
    mappedData = getMappedData()
  })

  describe('when DAL returns data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMapBusinessDetailsBySbi.mockReturnValue(mappedData)
    })

    test('should call DAL connector with businessDetailsBySbi and sbi', async () => {
      await fetchSbiSearchDetailsService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        businessDetailsBySbi,
        { sbi },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchSbiSearchDetailsService(sbi, email)

      expect(mockDalConnector.query).toHaveBeenCalled()
      expect(mockMapBusinessDetailsBySbi).toHaveBeenCalledWith(dalData)
      expect(result).toEqual(mappedData)
    })
  })

  describe('when the DAL says business is not found', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        errors: [{ message: 'Rural payments organisation not found' }],
        statusCode: 200
      })
    })

    test('should return null', async () => {
      const result = await fetchSbiSearchDetailsService(sbi, email)

      expect(result).toEqual(null)
      expect(mockMapBusinessDetailsBySbi).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL returns another error', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        errors: [{ message: 'error response from dal' }],
        statusCode: 500
      })
    })

    test('should throw a generic error', async () => {
      await expect(fetchSbiSearchDetailsService(sbi, email)).rejects.toThrowError('Failed to retrieve business details')

      expect(mockMapBusinessDetailsBySbi).not.toHaveBeenCalled()
    })
  })
})
