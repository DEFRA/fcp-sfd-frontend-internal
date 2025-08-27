// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessAddressChangeService } from '../../../../src/services/business/fetch-business-address-change-service.js'
import { updateBusinessAddressChangeService } from '../../../../src/services/business/update-business-address-change-service.js'

// Thing under test
import { businessAddressCheckRoutes } from '../../../../src/routes/business/business-address-check-routes.js'
const [getBusinessAddressCheck, postBusinessAddressCheck] = businessAddressCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-address-change-service.js', () => ({
  fetchBusinessAddressChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-address-change-service.js', () => ({
  updateBusinessAddressChangeService: vi.fn()
}))

describe('business address check', () => {
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

  describe('GET /business-address-enter', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessAddressChangeService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessAddressCheck.method).toBe('GET')
        expect(getBusinessAddressCheck.path).toBe('/business-address-check')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(fetchBusinessAddressChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-address-check view with page data', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-check', getPageData())
      })
    })
  })

  describe('POST /business-address-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    describe('when a request succeeds', () => {
      test('it redirects to the /business-details page', async () => {
        await postBusinessAddressCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business-details')
      })

      test('sets the payload on the yar state', async () => {
        await postBusinessAddressCheck.handler(request, h)

        expect(updateBusinessAddressChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })
    })
  })
})

const getMockData = () => {
  return {
    address: {
      address1: '10 Skirbeck Way',
      address2: '',
      city: 'Maidstone',
      county: '',
      postcode: 'SK22 1DL',
      country: 'United Kingdom'
    },
    info: {
      sbi: '123456789',
      businessName: 'Agile Farm Ltd'
    },
    customer: {
      fullName: 'Alfred Waldron'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-address-enter' },
    changeLink: '/business-address-enter',
    pageTitle: 'Check your business address is correct before submitting',
    metaDescription: 'Check the address for your business is correct.',
    address: [
      '10 Skirbeck Way',
      'Maidstone',
      'SK22 1DL',
      'United Kingdom'
    ],
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}
