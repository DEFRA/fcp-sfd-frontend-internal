// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { validateBusinessRegistrationNumberService } from '../../../../src/services/business/validate-business-registration-number-service.js'

// Thing under test
import { businessLegalStatusEnterRoutes } from '../../../../src/routes/business/business-legal-status-enter-routes.js'
const [getBusinessLegalStatusEnter, postBusinessLegalStatusEnter] = businessLegalStatusEnterRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/validate-business-registration-number-service.js', () => ({
  validateBusinessRegistrationNumberService: vi.fn()
}))

describe('business legal status enter', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: { set: vi.fn(), get: vi.fn().mockReturnValue({ sbi: '106705779' }) },
      payload: {}
    }

    const responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => responseStub)
    }

    fetchBusinessChangeService.mockResolvedValue(getMockData())
  })

  describe('GET /business/{sbi}/business-legal-status-enter', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessLegalStatusEnter.method).toBe('GET')
      expect(getBusinessLegalStatusEnter.path).toBe('/business/{sbi}/business-legal-status-enter')
    })

    test('it calls fetchBusinessChangeService with credentials and the legal status session fields', async () => {
      await getBusinessLegalStatusEnter.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, [
        'changeBusinessLegalStatus',
        'changeBusinessCharityCommissionRegistrationNumber',
        'changeBusinessCompanyRegistrationNumber'
      ])
    })

    test('should render business-legal-status-enter view with page data', async () => {
      await getBusinessLegalStatusEnter.handler(request, h)

      expect(h.view).toHaveBeenCalledWith('business/business-legal-status-enter', expect.any(Object))
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessLegalStatusEnter.options.pre).toBeDefined()
        expect(getBusinessLegalStatusEnter.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-legal-status-enter', () => {
    describe('and the number is valid', () => {
      test('it sets the registration number in session and redirects to check', async () => {
        request.payload = { charityCommissionRegistrationNumber: '1234567' }
        validateBusinessRegistrationNumberService.mockReturnValue({
          error: undefined,
          value: { charityCommissionRegistrationNumber: '1234567' },
          payloadField: 'charityCommissionRegistrationNumber',
          sessionField: 'changeBusinessCharityCommissionRegistrationNumber'
        })

        await postBusinessLegalStatusEnter.handler(request, h)

        expect(validateBusinessRegistrationNumberService).toHaveBeenCalledWith(undefined, request.payload)
        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessCharityCommissionRegistrationNumber',
          '1234567'
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-check')
      })
    })

    describe('and the number is invalid', () => {
      test('it renders the view with validation errors', async () => {
        request.payload = { charityCommissionRegistrationNumber: '' }
        validateBusinessRegistrationNumberService.mockReturnValue({
          error: {
            details: [
              {
                message: 'Enter the charity commission registration number',
                path: ['charityCommissionRegistrationNumber'],
                type: 'any.required'
              }
            ]
          },
          value: undefined,
          payloadField: 'charityCommissionRegistrationNumber',
          sessionField: 'changeBusinessCharityCommissionRegistrationNumber'
        })

        await postBusinessLegalStatusEnter.handler(request, h)

        expect(setSessionData).not.toHaveBeenCalled()
        expect(h.view).toHaveBeenCalledWith('business/business-legal-status-enter', expect.objectContaining({
          errors: expect.objectContaining({
            charityCommissionRegistrationNumber: expect.any(Object)
          })
        }))
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(postBusinessLegalStatusEnter.options.pre).toBeDefined()
        expect(postBusinessLegalStatusEnter.options.pre).toHaveLength(1)
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' }
})
