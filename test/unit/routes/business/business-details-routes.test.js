// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'
import { businessDetailsPresenter } from '../../../../src/presenters/business/business-details-presenter.js'

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

describe('business details routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '106705779' },
      auth: {
        credentials: { email: 'test.user@defra.gov.uk' }
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
        expect(businessDetailsPresenter).toHaveBeenCalledWith(businessDetails, '106705779')
        expect(h.view).toHaveBeenCalledWith('business/business-details', pageData)
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

    describe('when the sbi fails schema validation', () => {
      beforeEach(() => {
        request.params.sbi = 'not-a-valid-sbi'
      })

      test('redirects to /search-sbi', async () => {
        await getBusinessDetails.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(fetchBusinessDetailsService).not.toHaveBeenCalled()
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
