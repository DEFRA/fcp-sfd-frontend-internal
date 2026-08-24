// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessPhoneNumbersChangeService } from '../../../../src/services/business/update-business-phone-numbers-change-service.js'
import { businessPhoneNumbersCheckPresenter } from '../../../../src/presenters/business/business-phone-numbers-check-presenter.js'

// Shared pre-handler used to guard the SBI
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessPhoneNumbersCheckRoutes } from '../../../../src/routes/business/business-phone-numbers-check-routes.js'

const [getBusinessPhoneNumbersCheck, postBusinessPhoneNumbersCheck] = businessPhoneNumbersCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-phone-numbers-change-service.js', () => ({
  updateBusinessPhoneNumbersChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-phone-numbers-check-presenter.js', () => ({
  businessPhoneNumbersCheckPresenter: vi.fn()
}))

describe('business phone numbers check routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      info: { referrer: 'https://example.com/business/106705779/business-phone-numbers-change' }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }
  })

  describe('GET /business/{sbi}/business-phone-numbers-check', () => {
    const businessPhoneNumbersChange = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'Check your business phone numbers are correct before submitting' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessPhoneNumbersChange)
      businessPhoneNumbersCheckPresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessPhoneNumbersCheck.method).toBe('GET')
      expect(getBusinessPhoneNumbersCheck.path).toBe('/business/{sbi}/business-phone-numbers-check')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(getBusinessPhoneNumbersCheck.options.pre).toContain(validateSbi)
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessPhoneNumbersCheck.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessPhoneNumbers')
      expect(businessPhoneNumbersCheckPresenter).toHaveBeenCalledWith(businessPhoneNumbersChange, request.info.referrer)
      expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-check', pageData)
    })

    describe('when fetchBusinessChangeService throws', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockRejectedValue(new Error('Business not found'))
      })

      test('throws the error from the service', async () => {
        await expect(getBusinessPhoneNumbersCheck.handler(request, h)).rejects.toThrow('Business not found')
      })
    })
  })

  describe('POST /business/{sbi}/business-phone-numbers-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessPhoneNumbersCheck.method).toBe('POST')
      expect(postBusinessPhoneNumbersCheck.path).toBe('/business/{sbi}/business-phone-numbers-check')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(postBusinessPhoneNumbersCheck.options.pre).toContain(validateSbi)
    })

    test('updates the phone numbers and redirects to the business details page for the sbi', async () => {
      await postBusinessPhoneNumbersCheck.handler(request, h)

      expect(updateBusinessPhoneNumbersChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email)
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })

    describe('when updateBusinessPhoneNumbersChangeService throws', () => {
      beforeEach(() => {
        updateBusinessPhoneNumbersChangeService.mockRejectedValue(new Error('Update failed'))
      })

      test('throws the error from the service', async () => {
        await expect(postBusinessPhoneNumbersCheck.handler(request, h)).rejects.toThrow('Update failed')
      })
    })
  })
})
