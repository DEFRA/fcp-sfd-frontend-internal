// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { services } from '@defra/fcp-sfd-frontend-engine'
import { businessFixPresenter } from '../../../../src/presenters/business/business-fix-presenter.js'
import { fetchBusinessFixService } from '../../../../src/services/business/fetch-business-fix-service.js'

// Thing under test
import { businessFixRoutes } from '../../../../src/routes/business/business-fix-routes.js'
const [getBusinessFix, postBusinessFix] = businessFixRoutes

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  services: {
    initialiseFixJourney: vi.fn()
  },
  schemas: { business: { sbi: {} } }
}))

vi.mock('../../../../src/presenters/business/business-fix-presenter.js', () => ({
  businessFixPresenter: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-fix-service.js', () => ({
  fetchBusinessFixService: vi.fn()
}))

describe('business fix routes', () => {
  let request
  let h

  const sbi = '107183280'
  const email = 'test.user@defra.gov.uk'

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi },
      yar: {},
      query: { source: 'name' },
      auth: { credentials: { email } }
    }
  })

  describe('GET /business/{sbi}/details/fix', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        services.initialiseFixJourney.mockReturnValue(getMockSessionData())
        fetchBusinessFixService.mockResolvedValue('business details')
        businessFixPresenter.mockReturnValue(getPageData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessFix.method).toBe('GET')
        expect(getBusinessFix.path).toBe('/business/{sbi}/details/fix')
      })

      test('should have a pre-handler to validate the sbi', () => {
        expect(getBusinessFix.options.pre).toHaveLength(1)
      })

      test('it initialises the business fix journey using the session and source', async () => {
        await getBusinessFix.handler(request, h)

        expect(services.initialiseFixJourney).toHaveBeenCalledWith(request.yar, request.query.source, 'business')
      })

      test('it fetches business fix data using the sbi, email and session data', async () => {
        await getBusinessFix.handler(request, h)

        expect(fetchBusinessFixService).toHaveBeenCalledWith(sbi, email, getMockSessionData())
      })

      test('it presents the business details using the businessFixPresenter', async () => {
        await getBusinessFix.handler(request, h)

        expect(businessFixPresenter).toHaveBeenCalledWith('business details', sbi)
      })

      test('it renders the business-fix view with page data', async () => {
        await getBusinessFix.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-fix.njk', getPageData())
      })
    })

    describe('when there is no valid session data to fix', () => {
      beforeEach(() => {
        h = {
          redirect: vi.fn()
        }

        services.initialiseFixJourney.mockReturnValue(null)
      })

      test('it redirects to the business details page without fetching business data', async () => {
        await getBusinessFix.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith(`/business/${sbi}/details`)
        expect(fetchBusinessFixService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /business/{sbi}/details/fix', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn()
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessFix.method).toBe('POST')
      expect(postBusinessFix.path).toBe('/business/{sbi}/details/fix')
    })

    test('should have a pre-handler to validate the sbi', () => {
      expect(postBusinessFix.options.pre).toHaveLength(1)
    })

    test('it redirects to the business fix list page', async () => {
      await postBusinessFix.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith(`/business/${sbi}/details/fix-list`)
    })
  })
})

const getMockSessionData = () => {
  return {
    source: 'name',
    orderedSectionsToFix: ['name', 'email']
  }
}

const getPageData = () => {
  return {
    backLink: '/business/107183280/details',
    pageTitle: 'Update your business details',
    metaDescription: 'Update your business details.',
    businessName: 'Herberts Lawn Mowing',
    sbi: '107183280',
    updateText: 'We will ask you to update your business email address as well as your business name.',
    listOfErrors: []
  }
}
