// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessNameChangeService } from '../../../../src/services/business/update-business-name-change-service.js'
import { businessNameCheckPresenter } from '../../../../src/presenters/business/business-name-check-presenter.js'

// Shared pre-handler used to guard the SBI
import { validateSbi } from '../../../../src/routes/pre-handlers.js'

// Thing under test
import { businessNameCheckRoutes } from '../../../../src/routes/business/business-name-check-routes.js'

const [getBusinessNameCheck, postBusinessNameCheck] = businessNameCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-name-change-service.js', () => ({
  updateBusinessNameChangeService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-name-check-presenter.js', () => ({
  businessNameCheckPresenter: vi.fn()
}))

describe('business name check routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      yar: { get: vi.fn().mockReturnValue({ sbi: '106705779' }), set: vi.fn() },
      auth: { credentials: { email: 'test.user@defra.gov.uk' } },
      info: { referrer: 'https://example.com/business/106705779/business-name-change' }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn() })
    }
  })

  describe('GET /business/{sbi}/business-name-check', () => {
    const businessNameChange = { info: { sbi: '106705779' } }
    const pageData = { pageTitle: 'Check your business name is correct before submitting' }

    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(businessNameChange)
      businessNameCheckPresenter.mockReturnValue(pageData)
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessNameCheck.method).toBe('GET')
      expect(getBusinessNameCheck.path).toBe('/business/{sbi}/business-name-check')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(getBusinessNameCheck.options.pre).toContain(validateSbi)
    })

    test('fetches the business change details, presents them and renders the page', async () => {
      await getBusinessNameCheck.handler(request, h)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials, 'changeBusinessName')
      expect(businessNameCheckPresenter).toHaveBeenCalledWith(businessNameChange, request.info.referrer)
      expect(h.view).toHaveBeenCalledWith('business/business-name-check', pageData)
    })

    test('persists the sbi in session', async () => {
      await getBusinessNameCheck.handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
    })

    describe('when fetchBusinessChangeService throws', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockRejectedValue(new Error('Business not found'))
      })

      test('throws the error from the service', async () => {
        await expect(getBusinessNameCheck.handler(request, h)).rejects.toThrow('Business not found')
      })
    })
  })

  describe('POST /business/{sbi}/business-name-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessNameCheck.method).toBe('POST')
      expect(postBusinessNameCheck.path).toBe('/business/{sbi}/business-name-check')
    })

    test('guards the route with the shared validateSbi pre-handler', () => {
      expect(postBusinessNameCheck.options.pre).toContain(validateSbi)
    })

    test('updates the name and redirects to the business details page for the sbi', async () => {
      await postBusinessNameCheck.handler(request, h)

      expect(updateBusinessNameChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })

    describe('when updateBusinessNameChangeService throws', () => {
      beforeEach(() => {
        updateBusinessNameChangeService.mockRejectedValue(new Error('Update failed'))
      })

      test('throws the error from the service', async () => {
        await expect(postBusinessNameCheck.handler(request, h)).rejects.toThrow('Update failed')
      })
    })
  })
})
