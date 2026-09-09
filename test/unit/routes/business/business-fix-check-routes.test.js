// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessFixService } from '../../../../src/services/business/fetch-business-fix-service.js'
import { businessFixCheckPresenter } from '../../../../src/presenters/business/business-fix-check-presenter.js'
import { updateBusinessFixService } from '../../../../src/services/business/update-business-fix-service.js'

// Thing under test
import { businessFixCheckRoutes } from '../../../../src/routes/business/business-fix-check-routes.js'
const [getBusinessFixCheck, postBusinessFixCheck] = businessFixCheckRoutes

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: { business: { sbi: {} } },
  services: {
    checkInterrupterJourneySession: vi.fn()
  }
}))

vi.mock('../../../../src/services/business/fetch-business-fix-service.js', () => ({
  fetchBusinessFixService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-fix-check-presenter.js', () => ({
  businessFixCheckPresenter: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-fix-service.js', () => ({
  updateBusinessFixService: vi.fn()
}))

describe('business fix check routes', () => {
  let request
  let h
  let sessionData

  const sbi = '107183280'
  const email = 'test.user@defra.gov.uk'

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = {
      orderedSectionsToFix: ['name', 'email'],
      businessFixUpdates: {
        name: { businessName: 'Herberts Lawn Mowing' }
      }
    }

    request = {
      params: { sbi },
      yar: {
        get: vi.fn(() => sessionData)
      },
      auth: { credentials: { email } }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn()
    }
  })

  describe('GET /business/{sbi}/details/fix-check', () => {
    beforeEach(() => {
      fetchBusinessFixService.mockResolvedValue({ some: 'data' })
      businessFixCheckPresenter.mockReturnValue({ page: 'data' })
    })

    test('should have the correct method and path configured', () => {
      expect(getBusinessFixCheck.method).toBe('GET')
      expect(getBusinessFixCheck.path).toBe('/business/{sbi}/details/fix-check')
    })

    test('should have a pre-handler to validate the sbi and guard the interrupted journey session', () => {
      expect(getBusinessFixCheck.options.pre).toHaveLength(1)
    })

    test('it fetches business fix data', async () => {
      await getBusinessFixCheck.handler(request, h)

      expect(fetchBusinessFixService).toHaveBeenCalledWith(sbi, email, sessionData)
    })

    test('it presents the business fix data', async () => {
      await getBusinessFixCheck.handler(request, h)

      expect(businessFixCheckPresenter).toHaveBeenCalledWith({ some: 'data' }, sbi)
    })

    test('should render business-fix-check view with page data', async () => {
      await getBusinessFixCheck.handler(request, h)

      expect(h.view).toHaveBeenCalledWith('business/business-fix-check.njk', { page: 'data' })
    })
  })

  describe('POST /business/{sbi}/details/fix-check', () => {
    test('should have the correct method and path configured', () => {
      expect(postBusinessFixCheck.method).toBe('POST')
      expect(postBusinessFixCheck.path).toBe('/business/{sbi}/details/fix-check')
    })

    test('should have a pre-handler to validate the sbi and guard the interrupted journey session', () => {
      expect(postBusinessFixCheck.options.pre).toHaveLength(1)
    })

    test('it submits the business fixes', async () => {
      await postBusinessFixCheck.handler(request, h)

      expect(updateBusinessFixService).toHaveBeenCalledWith(sbi, sessionData, request.yar, email)
    })

    test('it redirects to the business details page', async () => {
      await postBusinessFixCheck.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith(`/business/${sbi}/details`)
    })
  })
})
