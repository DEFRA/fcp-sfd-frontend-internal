// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'
import { updateBusinessVatChangeService } from '../../../../src/services/business/update-business-vat-change-service.js'

// Thing under test
import { businessVatCheckRoutes } from '../../../../src/routes/business/business-vat-check-routes.js'
const [getBusinessVatCheck, postBusinessVatCheck] = businessVatCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-vat-change-service.js', () => ({
  updateBusinessVatChangeService: vi.fn()
}))

describe('business VAT check', () => {
  const request = {
    yar: {
      set: vi.fn(),
      get: vi.fn().mockReturnValue(getMockData())
    },
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

  describe('GET /business-vat-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessVatCheck.method).toBe('GET')
        expect(getBusinessVatCheck.path).toBe('/business-vat-check')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessVatCheck.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-vat-check view with page data', async () => {
        await getBusinessVatCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-vat-check', getPageData())
      })
    })
  })

  describe('POST /business-vat-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    describe('when a request succeeds', () => {
      test('it redirects to the /business-details page', async () => {
        await postBusinessVatCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business-details')
      })

      test('calls the update service', async () => {
        await postBusinessVatCheck.handler(request, h)

        expect(updateBusinessVatChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      businessName: 'Agile Farm Ltd',
      sbi: '123456789',
      vat: 'GB123456789'
    },
    customer: {
      fullName: 'Alfred Waldron'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-vat-change' },
    changeLink: '/business-vat-change',
    pageTitle: 'Check your VAT registration number is correct before submitting',
    metaDescription: 'Check the VAT registration number for your business is correct.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    vatNumber: 'GB123456789'
  }
}
