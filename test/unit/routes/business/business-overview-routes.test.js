// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessOverviewService } from '../../../../src/services/business/fetch-business-overview-service.js'
import { businessOverviewPresenter } from '../../../../src/presenters/business/business-overview-presenter.js'

// Test helpers
import { BAD_REQUEST } from '../../../../src/constants/status-codes.js'
import { getMappedData, getPresentedData } from '../../../mocks/mock-business-overview.js'

// Thing under test
import { businessOverviewRoutes } from '../../../../src/routes/business/business-overview-routes.js'
const [getBusinessOverview] = businessOverviewRoutes

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: {
    business: {
      sbi: {
        type: 'object'
      }
    }
  },
  utils: {
    formatValidationErrors: (details) => {
      return details.reduce((acc, detail) => {
        acc[detail.path[0]] = { text: detail.message }
        return acc
      }, {})
    }
  }
}))

// Mocks
vi.mock('../../../../src/services/business/fetch-business-overview-service.js', () => ({
  fetchBusinessOverviewService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-overview-presenter.js', () => ({
  businessOverviewPresenter: vi.fn()
}))

describe('business overview routes', () => {
  let request
  let h
  let responseStub

  beforeEach(() => {
    vi.clearAllMocks()

    responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    request = {
      query: {
        sbi: '106705779'
      },
      auth: {
        credentials: {
          email: 'test.user@defra.gov.uk'
        }
      }
    }

    h = {
      view: vi.fn(() => responseStub),
      redirect: vi.fn()
    }
  })

  describe('GET /business-overview', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessOverview.method).toBe('GET')
      expect(getBusinessOverview.path).toBe('/business-overview')
    })

    describe('when the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Enter the full SBI',
              path: ['sbi'],
              type: 'string.pattern.base'
            }
          ]
        }
      })

      test('it renders the view with a validation error and bad request status', async () => {
        await getBusinessOverview.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('business/business-overview', {
          errors: {
            sbi: {
              text: 'Enter the full SBI'
            }
          }
        })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
      })

      test('it should handle undefined errors', async () => {
        await getBusinessOverview.options.validate.failAction(request, h, [])

        expect(h.view).toHaveBeenCalledWith('business/business-overview', {
          errors: {}
        })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
      })
    })

    describe('when sbi query param is empty', () => {
      beforeEach(() => {
        request.query.sbi = ''
      })

      test('should redirect to search-sbi', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when sbi query param is missing', () => {
      beforeEach(() => {
        request.query = {}
      })

      test('should redirect to search-sbi', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when sbi is valid', () => {
      const mappedData = getMappedData()
      const presentedData = getPresentedData()

      beforeEach(() => {
        fetchBusinessOverviewService.mockResolvedValue(mappedData)
        businessOverviewPresenter.mockReturnValue(presentedData)
      })

      test('should call service with sbi and email', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(fetchBusinessOverviewService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
      })

      test('should call presenter with service result and default page 1', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(mappedData, 1)
      })

      test('should render the business overview view with presented data', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-overview', presentedData)
      })
    })

    describe('when sbi has leading/trailing whitespace', () => {
      beforeEach(() => {
        request.query.sbi = '  106705779  '
        fetchBusinessOverviewService.mockResolvedValue(getMappedData())
        businessOverviewPresenter.mockReturnValue(getPresentedData())
      })

      test('should trim the sbi before calling the service', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(fetchBusinessOverviewService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
      })
    })

    describe('when page query param is provided', () => {
      beforeEach(() => {
        request.query.page = '3'
        fetchBusinessOverviewService.mockResolvedValue(getMappedData())
        businessOverviewPresenter.mockReturnValue(getPresentedData())
      })

      test('should pass the page number to the presenter', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(getMappedData(), 3)
      })
    })

    describe('when page query param is not a number', () => {
      beforeEach(() => {
        request.query.page = 'abc'
        fetchBusinessOverviewService.mockResolvedValue(getMappedData())
        businessOverviewPresenter.mockReturnValue(getPresentedData())
      })

      test('should default to page 1', async () => {
        await getBusinessOverview.options.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(getMappedData(), 1)
      })
    })
  })
})
