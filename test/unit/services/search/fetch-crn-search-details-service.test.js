// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { customerDetailsByCrn } from '../../../../src/dal/queries/customer-details-by-crn.js'

// Test helpers
import { getDalData, getMappedData } from '../../../mocks/mock-customer-details-by-crn.js'

// Mock dependencies
const mockMapCustomerDetailsByCrn = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/customer-details-by-crn-mapper.js', () => ({
  mapCustomerDetailsByCrn: mockMapCustomerDetailsByCrn
}))

// Thing under test
const { fetchCrnSearchDetailsService } = await import('../../../../src/services/search/fetch-crn-search-details-service.js')

describe('fetchCrnSearchDetailsService', () => {
  let crn
  let email
  let dalData
  let mappedData

  beforeEach(() => {
    vi.clearAllMocks()

    crn = '1234567890'
    email = 'test.farmer@test.farm.com'

    dalData = getDalData()
    mappedData = getMappedData()
  })

  describe('when DAL returns data', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({ data: dalData })
      mockMapCustomerDetailsByCrn.mockReturnValue(mappedData)
    })

    test('should call DAL connector with customerDetailsByCrn and crn', async () => {
      await fetchCrnSearchDetailsService(crn, email)

      expect(mockDalConnector.query).toHaveBeenCalledWith(
        customerDetailsByCrn,
        { crn },
        email
      )
    })

    test('should return mapped data', async () => {
      const result = await fetchCrnSearchDetailsService(crn, email)

      expect(mockDalConnector.query).toHaveBeenCalled()
      expect(mockMapCustomerDetailsByCrn).toHaveBeenCalledWith(dalData)
      expect(result).toEqual(mappedData)
    })
  })

  describe('when the DAL says customer is not found', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        errors: [{ message: 'Rural payments customer not found' }],
        statusCode: 200
      })
    })

    test('should return null', async () => {
      const result = await fetchCrnSearchDetailsService(crn, email)

      expect(result).toEqual(null)
      expect(mockMapCustomerDetailsByCrn).not.toHaveBeenCalled()
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
      await expect(fetchCrnSearchDetailsService(crn, email)).rejects.toThrowError('Failed to retrieve customer details')

      expect(mockMapCustomerDetailsByCrn).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL response has no errors property', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        statusCode: 500
      })
    })

    test('should throw a generic error without crashing on undefined errors', async () => {
      await expect(fetchCrnSearchDetailsService(crn, email)).rejects.toThrowError('Failed to retrieve customer details')

      expect(mockMapCustomerDetailsByCrn).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL response has an empty errors array', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        errors: [],
        statusCode: 500
      })
    })

    test('should throw a generic error without crashing on empty array', async () => {
      await expect(fetchCrnSearchDetailsService(crn, email)).rejects.toThrowError('Failed to retrieve customer details')

      expect(mockMapCustomerDetailsByCrn).not.toHaveBeenCalled()
    })
  })
})
