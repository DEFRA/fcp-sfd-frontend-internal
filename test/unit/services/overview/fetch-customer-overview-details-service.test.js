// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { customerDetailsOverview } from '../../../../src/dal/queries/overview/customer-details-overview.js'

// Mock dependencies
const mockMapCustomerOverviewDetails = vi.fn()
const mockDalConnector = { query: vi.fn() }

// Mock imports
vi.mock('../../../../src/dal/connector.js', () => ({
	getDalConnector: vi.fn(() => mockDalConnector)
}))

vi.mock('../../../../src/mappers/overview/customer-overview-details-mapper.js', () => ({
	mapCustomerOverviewDetails: mockMapCustomerOverviewDetails
}))

// Thing under test
const { fetchCustomerOverviewDetailsService } = await import('../../../../src/services/overview/fetch-customer-overview-details-service.js')

describe('fetchCustomerOverviewDetailsService', () => {
	let crn
	let email
	let dalData
	let mappedData

	beforeEach(() => {
		vi.clearAllMocks()

		crn = '1234567890'
		email = 'test.farmer@test.farm.com'

		dalData = {
      customer: {
        customerId: 123456,
        name: 'Test Farmer'
      }
    }

		mappedData = {
      crn: '1234567890',
      customerName: 'Test Farmer'
    }
	})

	describe('when DAL returns data', () => {
		beforeEach(() => {
			mockDalConnector.query.mockResolvedValue({ data: dalData })
			mockMapCustomerOverviewDetails.mockReturnValue(mappedData)
		})

		test('should call DAL connector with customerDetailsOverview and crn', async () => {
			await fetchCustomerOverviewDetailsService(crn, email)

			expect(mockDalConnector.query).toHaveBeenCalledWith(
				customerDetailsOverview,
				{ crn },
				email
			)
		})

		test('should return mapped data', async () => {
			const result = await fetchCustomerOverviewDetailsService(crn, email)

			expect(mockDalConnector.query).toHaveBeenCalled()
			expect(mockMapCustomerOverviewDetails).toHaveBeenCalledWith(dalData)
			expect(result).toEqual(mappedData)
		})
	})

	describe('when the DAL returns no data', () => {
		beforeEach(() => {
			mockDalConnector.query.mockResolvedValue({
				data: null
			})
		})

		test('should throw a generic error', async () => {
			await expect(fetchCustomerOverviewDetailsService(crn, email)).rejects.toThrowError('Failed to retrieve customer details')

			expect(mockMapCustomerOverviewDetails).not.toHaveBeenCalled()
		})
	})
})
