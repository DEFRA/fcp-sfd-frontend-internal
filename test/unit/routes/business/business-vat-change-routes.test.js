// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { businessVatChangePresenter } from '../../../../src/presenters/business/business-vat-change-presenter.js'
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

// Thing under test
import { businessVatChangeRoutes } from '../../../../src/routes/business/business-vat-change-routes.js'

const [getBusinessVatChange, postBusinessVatChange] = businessVatChangeRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-vat-change-presenter.js', () => ({
  businessVatChangePresenter: vi.fn()
}))

vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

describe('business VAT change routes', () => {
  let request
  let h

  const businessDetails = { info: { sbi: '106705779' } }
  const pageData = { pageTitle: 'What is your VAT registration number?' }

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      payload: { vatNumber: 'GB123456789' },
      info: { referrer: 'https://example.com/business/106705779/details' }
    }

    h = {
      view: vi.fn().mockReturnValue({ code: vi.fn().mockReturnValue({ takeover: vi.fn() }) }),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }

    fetchBusinessChangeService.mockResolvedValue(businessDetails)
    businessVatChangePresenter.mockReturnValue(pageData)
  })

  describe('GET /business/{sbi}/business-vat-registration-number-change', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessVatChange.method).toBe('GET')
      expect(getBusinessVatChange.path).toBe('/business/{sbi}/business-vat-registration-number-change')
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessVatChange.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessVat')
      expect(businessVatChangePresenter).toHaveBeenCalledWith(businessDetails)
      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-number-change', pageData)
    })

    test('persists the sbi in session', async () => {
      await getBusinessVatChange.handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-number-change', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessVatChange.method).toBe('POST')
      expect(postBusinessVatChange.path).toBe('/business/{sbi}/business-vat-registration-number-change')
    })

    test('stores the submitted VAT number in session and redirects to the check page', async () => {
      await postBusinessVatChange.options.handler(request, h)

      expect(setSessionData).toHaveBeenCalledWith(request.yar, 'businessDetailsUpdate', 'changeBusinessVat', 'GB123456789')
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-vat-registration-number-check')
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-number-change validation failAction', () => {
    test('re-fetches details and re-presents the page with the submitted VAT number and referrer', async () => {
      const err = {
        details: [
          {
            message: 'Enter a VAT registration number',
            path: ['vatNumber'],
            type: 'any.required'
          }
        ]
      }

      await postBusinessVatChange.options.validate.failAction(request, h, err)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessVat')
      expect(businessVatChangePresenter).toHaveBeenCalledWith(businessDetails, 'GB123456789')
      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-number-change', {
        ...pageData,
        errors: { vatNumber: { text: 'Enter a VAT registration number' } }
      })
    })

    test('it should handle undefined errors', async () => {
      await postBusinessVatChange.options.validate.failAction(request, h, {})

      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-number-change', {
        ...pageData,
        errors: {}
      })
    })
  })
})
