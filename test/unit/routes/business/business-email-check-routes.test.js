// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessEmailChangeService } from '../../../../src/services/business/fetch-business-email-change-service.js'
import { updateBusinessEmailChangeService } from '../../../../src/services/business/update-business-email-change-service.js'

// Thing under test
import { businessEmailCheckRoutes } from '../../../../src/routes/business/business-email-check-routes.js'
const [getBusinessEmailCheck, postBusinessEmailCheck] = businessEmailCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-email-change-service.js', () => ({
  fetchBusinessEmailChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-email-change-service.js', () => ({
  updateBusinessEmailChangeService: vi.fn()
}))

describe('business email check', () => {
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
  })

  describe('GET /business-email-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessEmailChangeService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessEmailCheck.method).toBe('GET')
        expect(getBusinessEmailCheck.path).toBe('/business-email-check')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessEmailCheck.handler(request, h)

        expect(fetchBusinessEmailChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-email-check view with page data', async () => {
        await getBusinessEmailCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-email-check', getPageData())
      })
    })
  })

  describe('POST /business-email-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    describe('when a request succeeds', () => {
      test('it redirects to the /business-details page', async () => {
        await postBusinessEmailCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business-details')
      })

      test('sets the payload on the yar state', async () => {
        await postBusinessEmailCheck.handler(request, h)

        expect(updateBusinessEmailChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      sbi: '123456789',
      businessName: 'Agile Farm Ltd'
    },
    customer: {
      fullName: 'Alfred Waldron'
    },
    contact: {
      email: 'test@test.com'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-email-change' },
    changeLink: '/business-email-change',
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    businessEmail: 'test@test.com',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}
