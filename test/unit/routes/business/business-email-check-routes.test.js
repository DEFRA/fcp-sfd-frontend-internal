// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessEmailChangeService } from '../../../../src/services/business/update-business-email-change-service.js'
import { businessEmailCheckPresenter } from '../../../../src/presenters/business/business-email-check-presenter.js'

// Thing under test
import { businessEmailCheckRoutes } from '../../../../src/routes/business/business-email-check-routes.js'

const [getBusinessEmailCheck, postBusinessEmailCheck] = businessEmailCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-email-change-service.js', () => ({
  updateBusinessEmailChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-email-check-presenter.js', () => ({
  businessEmailCheckPresenter: vi.fn()
}))

describe('business email check routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      info: { referrer: 'https://example.com/business/106705779/business-email-change' }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }
  })

  describe('GET /business/{sbi}/business-email-check', () => {
    const businessEmailChange = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'Check your business email address is correct before submitting' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessEmailChange)
      businessEmailCheckPresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessEmailCheck.method).toBe('GET')
      expect(getBusinessEmailCheck.path).toBe('/business/{sbi}/business-email-check')
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessEmailCheck.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessEmail')
      expect(businessEmailCheckPresenter).toHaveBeenCalledWith(businessEmailChange, request.info.referrer)
      expect(h.view).toHaveBeenCalledWith('business/business-email-check', pageData)
    })

    test('redirects to search-sbi when sbi is invalid', async () => {
      request.params.sbi = 'invalid'

      await getBusinessEmailCheck.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
    })

    test('persists the sbi in session', async () => {
      await getBusinessEmailCheck.handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
    })
  })

  describe('POST /business/{sbi}/business-email-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessEmailCheck.method).toBe('POST')
      expect(postBusinessEmailCheck.path).toBe('/business/{sbi}/business-email-check')
    })

    test('updates the email and redirects to the business details page for the sbi', async () => {
      await postBusinessEmailCheck.handler(request, h)

      expect(updateBusinessEmailChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })
  })
})
