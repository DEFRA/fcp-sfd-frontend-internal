// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { utils, schemas, constants, services } from '@defra/fcp-sfd-frontend-engine'
import { fetchPersonalFixService } from '../../../../src/services/fetch-personal-fix-service.js'
import { personalFixListPresenter } from '../../../../src/presenters/personal/personal-fix-list-presenter.js'

// Thing under test
import { personalFixListRoutes } from '../../../../src/routes/customer/personal-fix-list-routes.js'
const [getPersonalFixList, postPersonalFixList] = personalFixListRoutes

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  utils: { formatValidationErrors: vi.fn() },
  schemas: { personal: {} },
  constants: { statusCodes: { BAD_REQUEST: 400 } },
  services: {
    checkInterrupterJourneySession: vi.fn(),
    validateFixDetails: vi.fn(),
    setFixSessionData: vi.fn()
  }
}))

vi.mock('../../../../src/services/fetch-personal-fix-service.js', () => ({
  fetchPersonalFixService: vi.fn()
}))

vi.mock('../../../../src/presenters/personal/personal-fix-list-presenter.js', () => ({
  personalFixListPresenter: vi.fn()
}))

describe('personal fix list routes', () => {
  let request
  let h
  let sessionData
  let responseStub

  const crn = '987654321'
  const email = 'test@example.com'

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = {
      orderedSectionsToFix: ['name', 'email']
    }

    request = {
      params: { crn },
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

  describe('GET /customer/{crn}/details/fix-list', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalFixService.mockResolvedValue({ some: 'data' })
        personalFixListPresenter.mockReturnValue({ page: 'data' })
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalFixList.method).toBe('GET')
        expect(getPersonalFixList.path).toBe('/customer/{crn}/details/fix-list')
      })

      test('should have a pre-handler to validate the crn and guard the interrupted journey session', () => {
        expect(getPersonalFixList.options.pre).toHaveLength(1)
      })

      test('it fetches personal fix data', async () => {
        await getPersonalFixList.handler(request, h)

        expect(fetchPersonalFixService).toHaveBeenCalledWith(crn, email, sessionData)
      })

      test('it presents the personal fix data', async () => {
        await getPersonalFixList.handler(request, h)

        expect(personalFixListPresenter).toHaveBeenCalledWith({ some: 'data' }, null, crn, null)
      })

      test('should render personal-fix-list view with page data', async () => {
        await getPersonalFixList.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-fix-list.njk', { page: 'data' })
      })
    })
  })

  describe('POST /customer/{crn}/details/fix-list', () => {
    describe('when a request succeeds', () => {
      beforeEach(() => {
        request.payload = {
          first: 'John',
          personalEmail: 'john@example.com'
        }

        services.validateFixDetails.mockReturnValue({})
      })

      test('should have the correct method and path configured', () => {
        expect(postPersonalFixList.method).toBe('POST')
        expect(postPersonalFixList.path).toBe('/customer/{crn}/details/fix-list')
      })

      test('should have a pre-handler to validate the crn and guard the interrupted journey session', () => {
        expect(postPersonalFixList.options.pre).toHaveLength(1)
      })

      describe('when validation passes', () => {
        test('it stores the session data and redirects', async () => {
          await postPersonalFixList.handler(request, h)

          expect(services.validateFixDetails).toHaveBeenCalledWith(request.payload, sessionData.orderedSectionsToFix, schemas.personal)
          expect(services.setFixSessionData).toHaveBeenCalledWith(
            request.yar,
            sessionData,
            request.payload,
            'personalDetailsValidation',
            'personalFixUpdates'
          )
          expect(h.redirect).toHaveBeenCalledWith(`/customer/${crn}/details/fix-check`)
        })
      })

      describe('and the validation fails', () => {
        let validationError
        let errors

        beforeEach(() => {
          validationError = {
            details: [
              {
                message: 'Enter your first name',
                path: ['first']
              }
            ]
          }

          errors = [
            { field: 'first', message: 'Enter your first name' }
          ]

          services.validateFixDetails.mockReturnValue({ error: validationError })
          utils.formatValidationErrors.mockReturnValue(errors)
          fetchPersonalFixService.mockResolvedValue({ some: 'data' })
          personalFixListPresenter.mockReturnValue({ page: 'data', errors })
        })

        test('it formats validation errors', async () => {
          await postPersonalFixList.handler(request, h)

          expect(utils.formatValidationErrors).toHaveBeenCalledWith(validationError.details)
        })

        test('it fetches personal fix data', async () => {
          await postPersonalFixList.handler(request, h)

          expect(fetchPersonalFixService).toHaveBeenCalledWith(crn, email, sessionData)
        })

        test('it returns the page with the error summary banner, without redirecting', async () => {
          await postPersonalFixList.handler(request, h)

          expect(h.view).toHaveBeenCalledWith('personal/personal-fix-list.njk', { page: 'data', errors })
          expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
          expect(responseStub.takeover).toHaveBeenCalled()
          expect(h.redirect).not.toHaveBeenCalled()
        })
      })
    })
  })
})
