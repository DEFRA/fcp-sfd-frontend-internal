// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'

// Thing under test
import { businessLegalStatusChangeRoutes } from '../../../../src/routes/business/business-legal-status-change-routes.js'
const [getBusinessLegalStatusChange, postBusinessLegalStatusChange] = businessLegalStatusChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

describe('business legal status change', () => {
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

  describe('GET /business/{sbi}/business-legal-status-change', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessLegalStatusChange.method).toBe('GET')
      expect(getBusinessLegalStatusChange.path).toBe('/business/{sbi}/business-legal-status-change')
    })

    test('it calls fetchBusinessChangeService with credentials and changeBusinessLegalStatus', async () => {
      await getBusinessLegalStatusChange.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessLegalStatus')
    })

    test('should render business-legal-status-change view with page data', async () => {
      await getBusinessLegalStatusChange.handler(request, h)

      expect(h.view).toHaveBeenCalledWith('business/business-legal-status-change', expect.objectContaining({
        pageTitle: 'Change legal status'
      }))
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessLegalStatusChange.options.pre).toBeDefined()
        expect(getBusinessLegalStatusChange.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-legal-status-change', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessLegalStatusChange.method).toBe('POST')
      expect(postBusinessLegalStatusChange.path).toBe('/business/{sbi}/business-legal-status-change')
    })

    describe('when a legal status requiring a charity registration number is selected', () => {
      test('it sets session data and redirects to the enter page', async () => {
        request.payload = { businessLegalStatus: constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0] }

        await postBusinessLegalStatusChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessLegalStatus',
          request.payload.businessLegalStatus
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-enter')
      })
    })

    describe('when a legal status requiring a company registration number is selected', () => {
      test('it sets session data and redirects to the enter page', async () => {
        request.payload = { businessLegalStatus: constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES[0] }

        await postBusinessLegalStatusChange.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-enter')
      })
    })

    describe('when a legal status requiring no registration number is selected', () => {
      test('it sets session data and redirects to the check page', async () => {
        request.payload = { businessLegalStatus: '102111' } // Sole proprietorship

        await postBusinessLegalStatusChange.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-check')
      })
    })

    describe('and the validation fails', () => {
      test('it renders the view with validation errors', async () => {
        const validationError = {
          details: [
            {
              message: 'Select a legal status',
              path: ['businessLegalStatus'],
              type: 'any.required'
            }
          ]
        }

        request.payload = {}

        await postBusinessLegalStatusChange.options.validate.failAction(request, h, validationError)

        expect(h.view).toHaveBeenCalledWith('business/business-legal-status-change', expect.any(Object))
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(postBusinessLegalStatusChange.options.pre).toBeDefined()
        expect(postBusinessLegalStatusChange.options.pre).toHaveLength(1)
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing', legalStatusCode: '102111' }
})
