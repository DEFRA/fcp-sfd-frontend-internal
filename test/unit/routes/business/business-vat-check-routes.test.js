// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessVatChangeService } from '../../../../src/services/business/update-business-vat-change-service.js'
import { businessVatCheckPresenter } from '../../../../src/presenters/business/business-vat-check-presenter.js'

// Test helpers
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessVatCheckRoutes } from '../../../../src/routes/business/business-vat-check-routes.js'
const [getBusinessVatCheck, postBusinessVatCheck] = businessVatCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-vat-change-service.js', () => ({
  updateBusinessVatChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-vat-check-presenter.js', () => ({
  businessVatCheckPresenter: vi.fn()
}))

describe('business VAT check routes', () => {
  let request
  let h

  const businessDetails = { info: { sbi: '106705779' } }
  const pageData = { pageTitle: 'Check your VAT registration number is correct before submitting' }

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({}), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      info: { referrer: 'https://example.com/business/106705779/business-vat-registration-number-change' }
    }

    h = {
      view: vi.fn().mockReturnValue({}),
      redirect: vi.fn().mockReturnValue({})
    }

    fetchBusinessChangeService.mockResolvedValue(businessDetails)
    businessVatCheckPresenter.mockReturnValue(pageData)
  })

  describe('GET /business/{sbi}/business-vat-registration-number-check', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessVatCheck.method).toBe('GET')
      expect(getBusinessVatCheck.path).toBe('/business/{sbi}/business-vat-registration-number-check')
    })

    test('should guard the route with the sbi pre-handler', () => {
      expect(getBusinessVatCheck.options.pre).toEqual([validateSbi])
    })

    test('persists the sbi in session', async () => {
      await getBusinessVatCheck.handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessVatCheck.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessVat')
      expect(businessVatCheckPresenter).toHaveBeenCalledWith(businessDetails, request.info.referrer)
      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-number-check', pageData)
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-number-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessVatCheck.method).toBe('POST')
      expect(postBusinessVatCheck.path).toBe('/business/{sbi}/business-vat-registration-number-check')
    })

    test('should guard the route with the sbi pre-handler', () => {
      expect(postBusinessVatCheck.options.pre).toEqual([validateSbi])
    })

    test('updates the VAT number and redirects to the business details page', async () => {
      await postBusinessVatCheck.handler(request, h)

      expect(updateBusinessVatChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })
  })
})
