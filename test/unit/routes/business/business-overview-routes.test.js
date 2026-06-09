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

const { mockValidate, mockFormatValidationErrors } = vi.hoisted(() => ({
  mockValidate: vi.fn(),
  mockFormatValidationErrors: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: {
    business: {
      sbi: {
        validate: mockValidate
      }
    }
  },
  utils: {
    formatValidationErrors: mockFormatValidationErrors
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
      code: vi.fn().mockReturnThis()
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

    describe('when sbi query param is empty', () => {
      beforeEach(() => {
        request.query.sbi = ''
      })

      test('should redirect to search-sbi', async () => {
        await getBusinessOverview.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when sbi query param is missing', () => {
      beforeEach(() => {
        request.query = {}
      })

      test('should redirect to search-sbi', async () => {
        await getBusinessOverview.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when sbi validation fails', () => {
      const mockErrors = { sbi: { text: 'Enter a valid SBI' } }

      beforeEach(() => {
        mockValidate.mockReturnValue({
          error: { details: [{ path: ['sbi'], message: 'Enter a valid SBI' }] }
        })
        mockFormatValidationErrors.mockReturnValue(mockErrors)
      })

      test('should return the view with errors and a 400 status', async () => {
        await getBusinessOverview.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-overview', { errors: mockErrors })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
      })
    })

    describe('when sbi is valid', () => {
      const mappedData = getMappedData()
      const presentedData = getPresentedData()

      beforeEach(() => {
        mockValidate.mockReturnValue({ value: { sbi: '106705779' } })
        fetchBusinessOverviewService.mockResolvedValue(mappedData)
        businessOverviewPresenter.mockReturnValue(presentedData)
      })

      test('should call service with sbi and email', async () => {
        await getBusinessOverview.handler(request, h)

        expect(fetchBusinessOverviewService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
      })

      test('should call presenter with service result', async () => {
        await getBusinessOverview.handler(request, h)

        expect(businessOverviewPresenter).toHaveBeenCalledWith(mappedData)
      })

      test('should render the business overview view with presented data', async () => {
        await getBusinessOverview.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-overview', presentedData)
      })
    })

    describe('when sbi has leading/trailing whitespace', () => {
      beforeEach(() => {
        request.query.sbi = '  106705779  '
        mockValidate.mockReturnValue({ value: { sbi: '106705779' } })
        fetchBusinessOverviewService.mockResolvedValue(getMappedData())
        businessOverviewPresenter.mockReturnValue(getPresentedData())
      })

      test('should trim the sbi before validation', async () => {
        await getBusinessOverview.handler(request, h)

        expect(mockValidate).toHaveBeenCalledWith({ sbi: '106705779' })
      })
    })
  })
})
