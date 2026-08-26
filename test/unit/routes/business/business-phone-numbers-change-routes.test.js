// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Engine constants used by the route under test
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { businessPhoneNumbersChangePresenter } from '../../../../src/presenters/business/business-phone-numbers-change-presenter.js'
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

// Shared pre-handler used to guard the SBI
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessPhoneNumbersChangeRoutes } from '../../../../src/routes/business/business-phone-numbers-change-routes.js'

const [getBusinessPhoneNumbersChange, postBusinessPhoneNumbersChange] = businessPhoneNumbersChangeRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-phone-numbers-change-presenter.js', () => ({
  businessPhoneNumbersChangePresenter: vi.fn()
}))

vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

describe('business phone numbers change routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      payload: { businessTelephone: '01234567890', businessMobile: '07123456789' },
      info: { referrer: 'https://example.com/business/106705779/details' }
    }

    h = {
      view: vi.fn().mockReturnValue({ code: vi.fn().mockReturnValue({ takeover: vi.fn() }) }),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }
  })

  describe('GET /business/{sbi}/business-phone-numbers-change', () => {
    const businessDetails = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'What are your business phone numbers?' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)
      businessPhoneNumbersChangePresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessPhoneNumbersChange.method).toBe('GET')
      expect(getBusinessPhoneNumbersChange.path).toBe('/business/{sbi}/business-phone-numbers-change')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(getBusinessPhoneNumbersChange.options.pre).toContain(validateSbi)
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessPhoneNumbersChange.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessPhoneNumbers')
      expect(businessPhoneNumbersChangePresenter).toHaveBeenCalledWith(businessDetails)
      expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', pageData)
    })

    test('persists the sbi in session', async () => {
      await getBusinessPhoneNumbersChange.handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
    })

    describe('when fetchBusinessChangeService throws', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockRejectedValue(new Error('Business not found'))
      })

      test('throws the error from the service', async () => {
        await expect(getBusinessPhoneNumbersChange.handler(request, h)).rejects.toThrow('Business not found')
      })
    })
  })

  describe('POST /business/{sbi}/business-phone-numbers-change validation failAction', () => {
    const businessDetails = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'What are your business phone numbers?' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)
      businessPhoneNumbersChangePresenter.mockReturnValue(pageData)
    })

    test('re-fetches details and re-presents the page with the submitted phone numbers', async () => {
      const err = { details: [] }

      await postBusinessPhoneNumbersChange.options.validate.failAction(request, h, err)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessPhoneNumbers')
      expect(businessPhoneNumbersChangePresenter).toHaveBeenCalledWith(businessDetails, request.payload)
    })

    test('formats the validation errors and merges them into the page data with a 400 status', async () => {
      const err = {
        details: [
          { message: 'Enter a telephone number', path: ['businessTelephone'], type: 'string.empty' }
        ]
      }

      await postBusinessPhoneNumbersChange.options.validate.failAction(request, h, err)

      expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', {
        ...pageData,
        errors: { businessTelephone: { text: 'Enter a telephone number' } }
      })
      expect(h.view().code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
    })

    test('handles an error without details', async () => {
      const err = {}

      await postBusinessPhoneNumbersChange.options.validate.failAction(request, h, err)

      expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', { ...pageData, errors: {} })
    })
  })

  describe('POST /business/{sbi}/business-phone-numbers-change', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessPhoneNumbersChange.method).toBe('POST')
      expect(postBusinessPhoneNumbersChange.path).toBe('/business/{sbi}/business-phone-numbers-change')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(postBusinessPhoneNumbersChange.options.pre).toContain(validateSbi)
    })

    test('stores the submitted phone numbers in session and redirects to the check page', async () => {
      await postBusinessPhoneNumbersChange.options.handler(request, h)

      expect(setSessionData).toHaveBeenCalledWith(request.yar, 'businessDetailsUpdate', 'changeBusinessPhoneNumbers', {
        businessTelephone: '01234567890',
        businessMobile: '07123456789'
      })
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-phone-numbers-check')
    })

    test('stores null for phone numbers that were not submitted', async () => {
      request.payload = {}

      await postBusinessPhoneNumbersChange.options.handler(request, h)

      expect(setSessionData).toHaveBeenCalledWith(request.yar, 'businessDetailsUpdate', 'changeBusinessPhoneNumbers', {
        businessTelephone: null,
        businessMobile: null
      })
    })
  })
})
