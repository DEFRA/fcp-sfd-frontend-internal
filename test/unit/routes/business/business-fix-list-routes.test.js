// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { utils, schemas, constants, services } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessFixService } from '../../../../src/services/business/fetch-business-fix-service.js'
import { businessFixListPresenter } from '../../../../src/presenters/business/business-fix-list-presenter.js'

// Thing under test
import { businessFixListRoutes } from '../../../../src/routes/business/business-fix-list-routes.js'
const [getBusinessFixList, postBusinessFixList] = businessFixListRoutes

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  utils: { formatValidationErrors: vi.fn() },
  schemas: { business: { sbi: {}, details: {} } },
  constants: { statusCodes: { BAD_REQUEST: 400 } },
  services: {
    checkInterrupterJourneySession: vi.fn(),
    validateFixDetails: vi.fn(),
    setFixSessionData: vi.fn()
  }
}))

vi.mock('../../../../src/services/business/fetch-business-fix-service.js', () => ({
  fetchBusinessFixService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-fix-list-presenter.js', () => ({
  businessFixListPresenter: vi.fn()
}))

describe('business fix list routes', () => {
  let request
  let h
  let sessionData
  let responseStub

  const sbi = '107183280'
  const email = 'test.user@defra.gov.uk'

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = {
      orderedSectionsToFix: ['name', 'email']
    }

    request = {
      params: { sbi },
      yar: {
        get: vi.fn(() => sessionData)
      },
      auth: { credentials: { email } },
      payload: {}
    }

    responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => responseStub)
    }
  })

  describe('GET /business/{sbi}/details/fix-list', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessFixService.mockResolvedValue({ some: 'data' })
        businessFixListPresenter.mockReturnValue({ page: 'data' })
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessFixList.method).toBe('GET')
        expect(getBusinessFixList.path).toBe('/business/{sbi}/details/fix-list')
      })

      test('should have a pre-handler to validate the sbi and guard the interrupted journey session', () => {
        expect(getBusinessFixList.options.pre).toHaveLength(1)
      })

      test('it fetches business fix data', async () => {
        await getBusinessFixList.handler(request, h)

        expect(fetchBusinessFixService).toHaveBeenCalledWith(sbi, email, sessionData)
      })

      test('it presents the business fix data', async () => {
        await getBusinessFixList.handler(request, h)

        expect(businessFixListPresenter).toHaveBeenCalledWith({ some: 'data' }, null, sbi, null)
      })

      test('should render business-fix-list view with page data', async () => {
        await getBusinessFixList.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-fix-list.njk', { page: 'data' })
      })
    })
  })

  describe('POST /business/{sbi}/details/fix-list', () => {
    beforeEach(() => {
      request.payload = {
        businessName: 'Herberts Lawn Mowing',
        businessEmail: 'herbert@example.com'
      }

      services.validateFixDetails.mockReturnValue({})
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessFixList.method).toBe('POST')
      expect(postBusinessFixList.path).toBe('/business/{sbi}/details/fix-list')
    })

    test('should have a pre-handler to validate the sbi and guard the interrupted journey session', () => {
      expect(postBusinessFixList.options.pre).toHaveLength(1)
    })

    describe('when validation passes', () => {
      test('it stores the session data and redirects', async () => {
        await postBusinessFixList.handler(request, h)

        expect(services.validateFixDetails).toHaveBeenCalledWith(request.payload, sessionData.orderedSectionsToFix, schemas.business.details)
        expect(services.setFixSessionData).toHaveBeenCalledWith(
          request.yar,
          sessionData,
          request.payload,
          'businessDetailsValidation',
          'businessFixUpdates'
        )
        expect(h.redirect).toHaveBeenCalledWith(`/business/${sbi}/details/fix-check`)
      })
    })

    describe('and the validation fails', () => {
      let validationError
      let errors

      beforeEach(() => {
        validationError = {
          details: [
            {
              message: 'Enter the business name',
              path: ['businessName']
            }
          ]
        }

        errors = [
          { field: 'businessName', message: 'Enter the business name' }
        ]

        services.validateFixDetails.mockReturnValue({ error: validationError })
        utils.formatValidationErrors.mockReturnValue(errors)
        fetchBusinessFixService.mockResolvedValue({ some: 'data' })
        businessFixListPresenter.mockReturnValue({ page: 'data', errors })
      })

      test('it formats validation errors', async () => {
        await postBusinessFixList.handler(request, h)

        expect(utils.formatValidationErrors).toHaveBeenCalledWith(validationError.details)
      })

      test('it fetches business fix data', async () => {
        await postBusinessFixList.handler(request, h)

        expect(fetchBusinessFixService).toHaveBeenCalledWith(sbi, email, sessionData)
      })

      test('it returns the page with the error summary banner, without redirecting', async () => {
        await postBusinessFixList.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-fix-list.njk', { page: 'data', errors })
        expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })
  })
})
