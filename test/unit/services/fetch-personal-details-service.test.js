// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
const mockMappedValue = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../src/mappers/personal-details-mapper.js', () => ({
  mapPersonalDetails: mockMappedValue
}))

// Test helpers
const { getDalData, getMappedData } = await import('../../mocks/mock-personal-details.js')
const { personalDetailsQuery } = await import('../../../src/dal/queries/personal-details.js')

// Thing under test
const { fetchPersonalDetailsService } = await import('../../../src/services/fetch-personal-details-service.js')

describe('fetchPersonalDetailsService', () => {
  let crn
  let email
  let dalData
  let mappedData

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    crn = '123456890'
    email = 'test.farmer@test.farm.com'

    dalData = getDalData()
    mappedData = getMappedData()
  })

  describe('when fetching from the DAL', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMappedValue.mockReturnValue(mappedData)
    })

    test('should call DAL connector with personalDetailsQuery, crn and email', async () => {
      await fetchPersonalDetailsService(crn, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        personalDetailsQuery,
        { crn },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchPersonalDetailsService(crn, email)

      expect(mockDalConnector.query).toHaveBeenCalled()
      expect(mockMappedValue).toHaveBeenCalledWith(dalData)
      expect(result).toEqual(mappedData)
    })
  })

  describe('when the DAL returns no data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null
      })
    })

    test('should throw Boom.notFound error', async () => {
      await expect(fetchPersonalDetailsService(crn, email)).rejects.toThrow('Customer personal details not found')

      expect(mockMappedValue).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL returns an error', () => {
    const dalError = new Error('DAL connection failed')

    beforeEach(() => {
      mockDalConnector.query.mockRejectedValue(dalError)
    })

    test('should throw the error from the DAL', async () => {
      await expect(fetchPersonalDetailsService(crn, email)).rejects.toThrow('DAL connection failed')

      expect(mockMappedValue).not.toHaveBeenCalled()
    })
  })
})
