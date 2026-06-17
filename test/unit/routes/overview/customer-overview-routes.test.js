// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchCustomerOverviewDetailsService } from '../../../../src/services/overview/fetch-customer-overview-details-service.js'
import { customerOverviewPresenter } from '../../../../src/presenters/overview/customer-overview-presenter.js'

// Thing under test
import { customerOverviewRoutes } from '../../../../src/routes/overview/customer-overview-routes.js'

const [getCustomerOverview] = customerOverviewRoutes

// Mocks
vi.mock('../../../../src/services/overview/fetch-customer-overview-details-service.js', () => ({
	fetchCustomerOverviewDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/overview/customer-overview-presenter.js', () => ({
	customerOverviewPresenter: vi.fn()
}))

describe('customer overview routes', () => {
	let request
	let h

	beforeEach(() => {
		vi.clearAllMocks()

		request = {
			query: {
				page: '2'
			},
			params: {
				crn: '1234567890'
			},
			auth: {
				credentials: {
					email: 'test@example.com'
				}
			}
		}

		h = {
			view: vi.fn()
		}
	})

	describe('GET /customer-overview/{crn}', () => {
		test('should have the correct method and path configured', () => {
			expect(getCustomerOverview.method).toBe('GET')
			expect(getCustomerOverview.path).toBe('/customer-overview/{crn}')
		})

		describe('when auth credentials contain an email', () => {
			const customerDetails = {
				info: {
					crn: '1234567890',
					customerName: 'Jane Smith'
				},
				businesses: []
			}
			const pageData = {
				customerName: 'Jane Smith',
				crn: '1234567890',
				hasBusinesses: false,
				businesses: { rows: [] }
			}

			beforeEach(() => {
				fetchCustomerOverviewDetailsService.mockResolvedValue(customerDetails)
				customerOverviewPresenter.mockReturnValue(pageData)
			})

			test('it fetches details, presents them and renders the customer overview page', async () => {
				await getCustomerOverview.handler(request, h)

				expect(fetchCustomerOverviewDetailsService).toHaveBeenCalledWith('1234567890', 'test@example.com')
				expect(customerOverviewPresenter).toHaveBeenCalledWith(customerDetails, '2')
				expect(h.view).toHaveBeenCalledWith('overview/customer-overview', pageData)
			})
		})

		describe('when auth credentials have no email', () => {
			const customerDetails = {
				info: {
					crn: '1234567890',
					customerName: 'Jane Smith'
				},
				businesses: []
			}
			const pageData = {
				customerName: 'Jane Smith',
				crn: '1234567890',
				hasBusinesses: false,
				businesses: { rows: [] }
			}

			beforeEach(() => {
				request.auth = { credentials: undefined }
				fetchCustomerOverviewDetailsService.mockResolvedValue(customerDetails)
				customerOverviewPresenter.mockReturnValue(pageData)
			})

			test('it passes undefined email to the service and still renders the page', async () => {
				await getCustomerOverview.handler(request, h)

				expect(fetchCustomerOverviewDetailsService).toHaveBeenCalledWith('1234567890', undefined)
				expect(customerOverviewPresenter).toHaveBeenCalledWith(customerDetails, '2')
				expect(h.view).toHaveBeenCalledWith('overview/customer-overview', pageData)
			})
		})
	})
})
