// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessOverviewDetailsService } from '../../../../src/services/overview/fetch-business-overview-details-service.js'
import { businessOverviewPresenter } from '../../../../src/presenters/overview/business-overview-presenter.js'

// Thing under test
import { businessOverviewRoutes } from '../../../../src/routes/overview/business-overview-routes.js'

const [getBusinessOverview] = businessOverviewRoutes

// Mocks
vi.mock('../../../../src/services/overview/fetch-business-overview-details-service.js', () => ({
  fetchBusinessOverviewDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/overview/business-overview-presenter.js', () => ({
  businessOverviewPresenter: vi.fn()
}))

describe('business overview routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      query: {
        page: '2'
      },
      params: {
        sbi: '106705779'
      },
      auth: {
        credentials: {
          email: 'test.user@defra.gov.uk'
        }
      }
    }

    h = {
      view: vi.fn()
    }
  })

  describe('GET /business-overview/{sbi}', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessOverview.method).toBe('GET')
      expect(getBusinessOverview.path).toBe('/business-overview/{sbi}')
    })

    describe('when auth credentials contain an email', () => {
      const businessDetails = {
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        customers: []
      }
      const pageData = {
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        hasCustomers: false,
        customers: { rows: [] },
        pagination: null
      }

      beforeEach(() => {
        fetchBusinessOverviewDetailsService.mockResolvedValue(businessDetails)
        businessOverviewPresenter.mockReturnValue(pageData)
      })

      test('it fetches details, presents them and renders the business overview page', async () => {
        await getBusinessOverview.handler(request, h)

        expect(fetchBusinessOverviewDetailsService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
        expect(businessOverviewPresenter).toHaveBeenCalledWith(businessDetails, '2')
        expect(h.view).toHaveBeenCalledWith('overview/business-overview', pageData)
      })
    })

    describe('when auth credentials have no email', () => {
      const businessDetails = {
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        customers: []
      }
      const pageData = {
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        hasCustomers: false,
        customers: { rows: [] },
        pagination: null
      }

      beforeEach(() => {
        request.auth = { credentials: undefined }
        fetchBusinessOverviewDetailsService.mockResolvedValue(businessDetails)
        businessOverviewPresenter.mockReturnValue(pageData)
      })

      test('it passes undefined email to the service and still renders the page', async () => {
        await getBusinessOverview.handler(request, h)

        expect(fetchBusinessOverviewDetailsService).toHaveBeenCalledWith('106705779', undefined)
        expect(businessOverviewPresenter).toHaveBeenCalledWith(businessDetails, '2')
        expect(h.view).toHaveBeenCalledWith('overview/business-overview', pageData)
      })
    })
  })
})
