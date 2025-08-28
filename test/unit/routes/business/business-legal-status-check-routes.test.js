// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'
import { businessLegalStatusChangePresenter } from '../../../../src/presenters/business/business-legal-status-change-presenter.js'

// Thing under test
import { businessLegalStatusRoutes } from '../../../../src/routes/business/business-legal-status-change-routes.js'
const [getBusinessLegalStatusChange] = businessLegalStatusRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/business/business-legal-status-change-presenter.js', () => ({
  businessLegalStatusChangePresenter: vi.fn()
}))

describe('business legal status change', () => {
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

  describe('GET /business-legal-status-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessLegalStatusChange.method).toBe('GET')
        expect(getBusinessLegalStatusChange.path).toBe('/business-legal-status-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessLegalStatusChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-legal-status-change view with page data', async () => {
        businessLegalStatusChangePresenter.mockReturnValue(getPageData())

        await getBusinessLegalStatusChange.handler(request, h)

        expect(businessLegalStatusChangePresenter).toHaveBeenCalledWith(getMockData())
        expect(h.view).toHaveBeenCalledWith('business/business-legal-status-change', getPageData())
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      businessName: 'HENLEY, RE',
      legalStatus: { code: 102111, type: 'Sole Proprietorship' }
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'Change your legal status',
    metaDescription: 'Update the legal status of your business.',
    businessName: 'HENLEY, RE',
    businessLegalStatus: 'Sole Proprietorship',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}
