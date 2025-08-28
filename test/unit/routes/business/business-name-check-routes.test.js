// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessNameChangeService } from '../../../../src/services/business/fetch-business-name-change-service.js'
import { updateBusinessNameChangeService } from '../../../../src/services/business/update-business-name-change-service.js'

// Thing under test
import { businessNameCheckRoutes } from '../../../../src/routes/business/business-name-check-routes.js'
const [getBusinessNameCheck, postBusinessNameCheck] = businessNameCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-name-change-service.js', () => ({
  fetchBusinessNameChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-name-change-service.js', () => ({
  updateBusinessNameChangeService: vi.fn()
}))

describe('business name check', () => {
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

  describe('GET /business-name-enter', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessNameChangeService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessNameCheck.method).toBe('GET')
        expect(getBusinessNameCheck.path).toBe('/business-name-check')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessNameCheck.handler(request, h)

        expect(fetchBusinessNameChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-name-check view with page data', async () => {
        await getBusinessNameCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-name-check', getPageData())
      })
    })
  })

  describe('POST /business-name-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    describe('when a request succeeds', () => {
      test('it redirects to the /business-details page', async () => {
        await postBusinessNameCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business-details')
      })

      test('sets the payload on the yar state', async () => {
        await postBusinessNameCheck.handler(request, h)

        expect(updateBusinessNameChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
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
    changeBusinessName: 'New Business Name Ltd'
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-name-change' },
    changeLink: '/business-name-change',
    pageTitle: 'Check your business name is correct before submitting',
    metaDescription: 'Check the name for your business is correct.',
    businessName: 'Agile Farm Ltd',
    changeBusinessName: 'New Business Name Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}
