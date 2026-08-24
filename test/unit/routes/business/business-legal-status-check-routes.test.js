// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessLegalStatusChangeService } from '../../../../src/services/business/update-business-legal-status-change-service.js'

// Thing under test
import { businessLegalStatusCheckRoutes } from '../../../../src/routes/business/business-legal-status-check-routes.js'
const [getBusinessLegalStatusCheck, postBusinessLegalStatusCheck] = businessLegalStatusCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-legal-status-change-service.js', () => ({
  updateBusinessLegalStatusChangeService: vi.fn()
}))

describe('business legal status check', () => {
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
      redirect: vi.fn(() => responseStub),
      view: vi.fn(() => responseStub)
    }

    fetchBusinessChangeService.mockResolvedValue(getMockData())
  })

  describe('GET /business/{sbi}/business-legal-status-check', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessLegalStatusCheck.method).toBe('GET')
      expect(getBusinessLegalStatusCheck.path).toBe('/business/{sbi}/business-legal-status-check')
    })

    test('has pre-handlers for sbi validation and registration number validation', () => {
      expect(getBusinessLegalStatusCheck.options.pre).toBeDefined()
      expect(getBusinessLegalStatusCheck.options.pre).toHaveLength(2)
    })

    test('it calls fetchBusinessChangeService with credentials and the legal status session fields', async () => {
      await getBusinessLegalStatusCheck.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, [
        'changeBusinessLegalStatus',
        'changeBusinessCharityCommissionRegistrationNumber',
        'changeBusinessCompanyRegistrationNumber'
      ])
    })

    test('should render business-legal-status-check view with page data', async () => {
      await getBusinessLegalStatusCheck.handler(request, h)

      expect(h.view).toHaveBeenCalledWith('business/business-legal-status-check', expect.objectContaining({
        pageTitle: 'Check your business legal status is correct before submitting'
      }))
    })
  })

  describe('POST /business/{sbi}/business-legal-status-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessLegalStatusCheck.method).toBe('POST')
      expect(postBusinessLegalStatusCheck.path).toBe('/business/{sbi}/business-legal-status-check')
    })

    test('has pre-handlers for sbi validation and registration number validation', () => {
      expect(postBusinessLegalStatusCheck.options.pre).toBeDefined()
      expect(postBusinessLegalStatusCheck.options.pre).toHaveLength(2)
    })

    test('it calls updateBusinessLegalStatusChangeService and redirects to business details', async () => {
      await postBusinessLegalStatusCheck.handler(request, h)

      expect(updateBusinessLegalStatusChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing', legalStatusCode: '102111' }
})
