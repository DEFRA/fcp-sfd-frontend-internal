// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'
import { businessTypeChangePresenter } from '../../../../src/presenters/business/business-type-change-presenter.js'

// Thing under test
import { businessTypeRoutes } from '../../../../src/routes/business/business-type-change-routes.js'
const [getBusinessTypeChange] = businessTypeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-type-change-presenter.js', () => ({
  businessTypeChangePresenter: vi.fn()
}))

describe('business type change', () => {
  const request = {
    yar: {},
    auth: {
      credentials: {
        sbi: '123456789',
        crn: '987654321',
        email: 'test@example.com'
      }
    }
  }
  let h

  beforeEach(() => {
    vi.clearAllMocks()
    h = {
      view: vi.fn().mockReturnValue({})
    }
  })

  describe('GET /business-type-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessTypeChange.method).toBe('GET')
        expect(getBusinessTypeChange.path).toBe('/business-type-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessTypeChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-type-change view with page data', async () => {
        businessTypeChangePresenter.mockReturnValue(getPageData())

        await getBusinessTypeChange.handler(request, h)

        expect(businessTypeChangePresenter).toHaveBeenCalledWith(getMockData())
        expect(h.view).toHaveBeenCalledWith('business/business-type-change', getPageData())
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      sbi: '123456789',
      businessName: 'Agile Farm Ltd',
      type: 'Farmer'
    },
    customer: {
      fullName: 'Alfred Waldron'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'Change your business type',
    metaDescription: 'Update the type of your business.',
    businessName: 'Agile Farm Ltd',
    businessType: 'Farmer',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}
