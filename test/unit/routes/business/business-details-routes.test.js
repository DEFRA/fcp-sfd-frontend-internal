// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'
import { businessDetailsPresenter } from '../../../../src/presenters/business/business-details-presenter.js'
import { validateBusinessDetailsService } from '../../../../src/services/business/validate-business-details-service.js'

// Thing under test
import { businessDetailsRoutes } from '../../../../src/routes/business/business-details-routes.js'

const [getBusinessDetails] = businessDetailsRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-details-presenter.js', () => ({
  businessDetailsPresenter: vi.fn()
}))

vi.mock('../../../../src/services/business/validate-business-details-service.js', () => ({
  validateBusinessDetailsService: vi.fn()
}))

describe('business details routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    validateBusinessDetailsService.mockReturnValue({
      hasValidBusinessDetails: true,
      sectionsNeedingUpdate: []
    })

    request = {
      params: { sbi: '106705779' },
      auth: {
        credentials: { email: 'test.user@defra.gov.uk' }
      },
      yar: {
        set: vi.fn(),
        clear: vi.fn(),
        flash: vi.fn().mockReturnValue([])
      }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn().mockReturnThis() })
    }
  })

  describe('GET /business/{sbi}/details', () => {
    test('should have the correct method and path configured', () => {
      expect(getBusinessDetails.method).toBe('GET')
      expect(getBusinessDetails.path).toBe('/business/{sbi}/details')
    })

    describe('when sbi is valid and service returns data', () => {
      const businessDetails = { info: { businessName: 'Herberts Lawn Mowing' } }
      const pageData = { pageTitle: 'View and update your business details' }

      beforeEach(() => {
        fetchBusinessDetailsService.mockResolvedValue(businessDetails)
        businessDetailsPresenter.mockReturnValue(pageData)
      })

      test('fetches details, presents them and renders the business details page', async () => {
        await getBusinessDetails.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
        expect(businessDetailsPresenter).toHaveBeenCalledWith(businessDetails, '106705779', request.yar, true, [])
        expect(h.view).toHaveBeenCalledWith('business/business-details', pageData)
      })

      test('persists the sbi in session for downstream change journeys', async () => {
        await getBusinessDetails.handler(request, h)

        expect(request.yar.set).toHaveBeenCalledWith('businessDetailsUpdate', { sbi: '106705779' })
      })

      test('clears any stale interrupter journey session', async () => {
        await getBusinessDetails.handler(request, h)

        expect(request.yar.clear).toHaveBeenCalledWith('businessDetailsValidation')
      })

      test('does not seed the interrupter journey session when the details are valid', async () => {
        await getBusinessDetails.handler(request, h)

        expect(request.yar.set).not.toHaveBeenCalledWith('businessDetailsValidation', expect.anything())
      })
    })

    describe('when the business details are invalid', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockResolvedValue({})
        businessDetailsPresenter.mockReturnValue({})
        validateBusinessDetailsService.mockReturnValue({
          hasValidBusinessDetails: false,
          sectionsNeedingUpdate: ['name', 'email']
        })
      })

      test('seeds the interrupter journey session with the sections needing update', async () => {
        await getBusinessDetails.handler(request, h)

        expect(request.yar.set).toHaveBeenCalledWith('businessDetailsValidation', {
          businessDetailsValid: false,
          sectionsNeedingUpdate: ['name', 'email']
        })
      })

      test('passes the validation result to the presenter', async () => {
        await getBusinessDetails.handler(request, h)

        expect(businessDetailsPresenter).toHaveBeenCalledWith({}, '106705779', request.yar, false, ['name', 'email'])
      })
    })

    describe('when auth credentials have no email', () => {
      beforeEach(() => {
        request.auth = { credentials: undefined }
        fetchBusinessDetailsService.mockResolvedValue({})
        businessDetailsPresenter.mockReturnValue({})
      })
      test('passes undefined email to the service and still renders the page', async () => {
        await getBusinessDetails.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith('106705779', undefined)
      })
    })

    describe('when fetchBusinessDetailsService throws', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockRejectedValue(new Error('Business not found'))
      })

      test('throws the error from the service', async () => {
        await expect(getBusinessDetails.handler(request, h)).rejects.toThrow('Business not found')
      })
    })
  })
})
