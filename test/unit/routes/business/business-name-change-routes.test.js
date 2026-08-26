// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Engine constants used by the route under test
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { businessNameChangePresenter } from '../../../../src/presenters/business/business-name-change-presenter.js'
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

// Shared pre-handler used to guard the SBI
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessNameChangeRoutes } from '../../../../src/routes/business/business-name-change-routes.js'

const [getBusinessNameChange, postBusinessNameChange] = businessNameChangeRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-name-change-presenter.js', () => ({
  businessNameChangePresenter: vi.fn()
}))

vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

describe('business name change routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      payload: { businessName: 'New Farm Ltd' },
      info: { referrer: 'https://example.com/business/106705779/details' }
    }

    h = {
      view: vi.fn().mockReturnValue({ code: vi.fn().mockReturnValue({ takeover: vi.fn() }) }),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }
  })

  describe('GET /business/{sbi}/business-name-change', () => {
    const businessDetails = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'What is your business name?' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)
      businessNameChangePresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessNameChange.method).toBe('GET')
      expect(getBusinessNameChange.path).toBe('/business/{sbi}/business-name-change')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(getBusinessNameChange.options.pre).toContain(validateSbi)
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessNameChange.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessName')
      expect(businessNameChangePresenter).toHaveBeenCalledWith(businessDetails, undefined, request.info.referrer)
      expect(h.view).toHaveBeenCalledWith('business/business-name-change', pageData)
    })

    describe('when fetchBusinessChangeService throws', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockRejectedValue(new Error('Business not found'))
      })

      test('throws the error from the service', async () => {
        await expect(getBusinessNameChange.handler(request, h)).rejects.toThrow('Business not found')
      })
    })
  })

  describe('POST /business/{sbi}/business-name-change validation failAction', () => {
    const businessDetails = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'What is your business name?' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)
      businessNameChangePresenter.mockReturnValue(pageData)
    })

    test('re-fetches details and re-presents the page with the submitted name and referrer', async () => {
      const err = { details: [] }

      await postBusinessNameChange.options.validate.failAction(request, h, err)

      expect(businessNameChangePresenter).toHaveBeenCalledWith(businessDetails, 'New Farm Ltd', request.info.referrer)
    })

    test('formats the validation errors and merges them into the page data with a 400 status', async () => {
      const err = {
        details: [
          { message: 'Enter your business name', path: ['businessName'], type: 'string.empty' }
        ]
      }

      await postBusinessNameChange.options.validate.failAction(request, h, err)

      expect(h.view).toHaveBeenCalledWith('business/business-name-change', {
        ...pageData,
        errors: { businessName: { text: 'Enter your business name' } }
      })
      expect(h.view().code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
    })
  })

  describe('POST /business/{sbi}/business-name-change', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessNameChange.method).toBe('POST')
      expect(postBusinessNameChange.path).toBe('/business/{sbi}/business-name-change')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(postBusinessNameChange.options.pre).toContain(validateSbi)
    })

    test('stores the submitted name in session and redirects to the business name check page', async () => {
      await postBusinessNameChange.options.handler(request, h)

      expect(setSessionData).toHaveBeenCalledWith(request.yar, 'businessDetailsUpdate', 'changeBusinessName', 'New Farm Ltd')
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-name-check')
    })
  })
})
