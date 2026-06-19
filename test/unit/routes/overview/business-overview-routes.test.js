// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessOverviewService } from '../../../../src/services/overview/fetch-business-overview-details-service.js'
import { businessOverviewPresenter } from '../../../../src/presenters/overview/business-overview-presenter.js'

// Test helpers
import { getMappedData } from '../../../mocks/mock-business-overview.js'

// Thing under test
import { businessOverviewRoutes } from '../../../../src/routes/overview/business-overview-routes.js'
const [getBusinessOverview] = businessOverviewRoutes

// Mocks
vi.mock('../../../../src/services/overview/fetch-business-overview-service.js', () => ({
  fetchBusinessOverviewService: vi.fn()
}))

vi.mock('../../../../src/presenters/overview/business-overview-presenter.js', () => ({
  businessOverviewPresenter: vi.fn()
}))

describe('business overview routes', () => {
  let request
  let h
  let mappedData
  let presentedData

  beforeEach(() => {
    vi.clearAllMocks()

    mappedData = getMappedData()
    presentedData = { sbi: '106705779', businessName: 'Herberts Lawn Mowing', customers: [], pagination: null }

    request = {
      params: {
        sbi: '106705779'
      },
      query: {},
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

    describe('when sbi is valid', () => {
      beforeEach(() => {
        fetchBusinessOverviewService.mockResolvedValue(mappedData)
        businessOverviewPresenter.mockReturnValue(presentedData)
      })

      test('should call service with sbi and email', async () => {
        await getBusinessOverview.handler(request, h)

        expect(fetchBusinessOverviewService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
      })

      test('should call presenter with service result and page from query', async () => {
        await getBusinessOverview.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(mappedData, undefined)
      })

      test('should render the business overview view with presented data', async () => {
        await getBusinessOverview.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-overview', presentedData)
      })
    })

    describe('when page query param is provided', () => {
      beforeEach(() => {
        request.query.page = '3'
        fetchBusinessOverviewService.mockResolvedValue(mappedData)
        businessOverviewPresenter.mockReturnValue(presentedData)
      })

      test('should pass the page to the presenter', async () => {
        await getBusinessOverview.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(mappedData, '3')
      })
    })
  })
})
