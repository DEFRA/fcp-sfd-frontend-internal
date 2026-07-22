// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { businessEmailChangePresenter } from '../../../../src/presenters/business/business-email-change-presenter.js'
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

// Thing under test
import { businessEmailChangeRoutes } from '../../../../src/routes/business/business-email-change-routes.js'

const [getBusinessEmailChange, postBusinessEmailChange] = businessEmailChangeRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-email-change-presenter.js', () => ({
  businessEmailChangePresenter: vi.fn()
}))

vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

describe('business email change routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      yar: { get: vi.fn(), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      payload: { businessEmail: 'new@example.com' }
    }

    h = {
      view: vi.fn().mockReturnValue({ code: vi.fn().mockReturnValue({ takeover: vi.fn() }) }),
      redirect: vi.fn()
    }
  })

  describe('GET /business-email-change', () => {
    const businessDetails = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'What is your business email address?' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)
      businessEmailChangePresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessEmailChange.method).toBe('GET')
      expect(getBusinessEmailChange.path).toBe('/business-email-change')
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessEmailChange.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessEmail')
      expect(businessEmailChangePresenter).toHaveBeenCalledWith(businessDetails)
      expect(h.view).toHaveBeenCalledWith('business/business-email-change', pageData)
    })
  })

  describe('POST /business-email-change', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessEmailChange.method).toBe('POST')
      expect(postBusinessEmailChange.path).toBe('/business-email-change')
    })

    test('stores the submitted email in session and redirects to the check page', async () => {
      await postBusinessEmailChange.options.handler(request, h)

      expect(setSessionData).toHaveBeenCalledWith(request.yar, 'businessDetailsUpdate', 'changeBusinessEmail', 'new@example.com')
      expect(h.redirect).toHaveBeenCalledWith('/business-email-check')
    })
  })
})
