// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessVatRemoveService } from '../../../../src/services/business/update-business-vat-remove-service.js'
import { businessVatRemovePresenter } from '../../../../src/presenters/business/business-vat-remove-presenter.js'

// Test helpers
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessVatRemoveRoutes } from '../../../../src/routes/business/business-vat-remove-routes.js'

const [getBusinessVatRemove, postBusinessVatRemove] = businessVatRemoveRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-vat-remove-service.js', () => ({
  updateBusinessVatRemoveService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-vat-remove-presenter.js', () => ({
  businessVatRemovePresenter: vi.fn()
}))

describe('business VAT remove routes', () => {
  let request
  let h

  const businessDetails = { info: { sbi: '106705779', vat: 'GB123456789' } }
  const pageData = { pageTitle: 'Are you sure you want to remove your VAT registration number?' }

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn(), clear: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      payload: { confirmRemove: 'yes' }
    }

    h = {
      view: vi.fn().mockReturnValue({ code: vi.fn().mockReturnValue({ takeover: vi.fn() }) }),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }

    fetchBusinessChangeService.mockResolvedValue(businessDetails)
    businessVatRemovePresenter.mockReturnValue(pageData)
  })

  describe('GET /business/{sbi}/business-vat-registration-remove', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessVatRemove.method).toBe('GET')
      expect(getBusinessVatRemove.path).toBe('/business/{sbi}/business-vat-registration-remove')
    })

    test('should guard the route with the sbi pre-handler', () => {
      expect(getBusinessVatRemove.options.pre).toEqual([validateSbi])
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessVatRemove.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessVat')
      expect(businessVatRemovePresenter).toHaveBeenCalledWith(businessDetails)
      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-remove', pageData)
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-remove', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessVatRemove.method).toBe('POST')
      expect(postBusinessVatRemove.path).toBe('/business/{sbi}/business-vat-registration-remove')
    })

    test('should guard the route with the sbi pre-handler', () => {
      expect(postBusinessVatRemove.options.pre).toEqual([validateSbi])
    })

    describe('and the payload confirmRemove property is "yes"', () => {
      test('removes the VAT number and redirects to the business details page', async () => {
        await postBusinessVatRemove.handler(request, h)

        expect(updateBusinessVatRemoveService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email)
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
      })
    })

    describe('and the payload confirmRemove property is "no"', () => {
      beforeEach(() => {
        request.payload = { confirmRemove: 'no' }
      })

      test('does not remove the VAT number but still redirects to the business details page', async () => {
        await postBusinessVatRemove.handler(request, h)

        expect(updateBusinessVatRemoveService).not.toHaveBeenCalled()
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
      })

      test('clears any pending business details update from the session', async () => {
        await postBusinessVatRemove.handler(request, h)

        expect(request.yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
      })
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-remove validation failAction', () => {
    test('re-fetches the details and re-presents the page with the error summary banner', async () => {
      const err = {
        details: [
          {
            message: 'Select yes if you want to remove your VAT registration number',
            path: ['confirmRemove'],
            type: 'any.required'
          }
        ]
      }

      await postBusinessVatRemove.options.validate.failAction(request, h, err)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessVat')
      expect(businessVatRemovePresenter).toHaveBeenCalledWith(businessDetails, 'yes')
      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-remove', {
        ...pageData,
        errors: { confirmRemove: { text: 'Select yes if you want to remove your VAT registration number' } }
      })
    })

    test('it should handle undefined errors', async () => {
      await postBusinessVatRemove.options.validate.failAction(request, h, {})

      expect(h.view).toHaveBeenCalledWith('business/business-vat-registration-remove', {
        ...pageData,
        errors: {}
      })
    })

    test('it should handle a missing payload', async () => {
      request.payload = undefined

      await postBusinessVatRemove.options.validate.failAction(request, h, {})

      expect(businessVatRemovePresenter).toHaveBeenCalledWith(businessDetails, undefined)
    })
  })
})
