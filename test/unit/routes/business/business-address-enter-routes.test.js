// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { businessAddressRoutes } from '../../../../src/routes/business/business-address-enter-routes.js'
const [getBusinessAddressEnter, postBusinessAddressEnter] = businessAddressRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('business address enter', () => {
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
  let err

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /business-address-enter', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessAddressEnter.method).toBe('GET')
        expect(getBusinessAddressEnter.path).toBe('/business-address-enter')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-address-enter view with page data', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-enter', getPageData())
      })
    })
  })

  describe('POST /business-address-enter', () => {
    beforeEach(() => {
      const responseStub = {
        code: vi.fn().mockReturnThis(),
        takeover: vi.fn().mockReturnThis()
      }

      h = {
        redirect: vi.fn(() => h),
        view: vi.fn(() => responseStub)
      }

      // Mock yar.set for session
      request.yar = {
        set: vi.fn(),
        get: vi.fn().mockReturnValue(getMockData())
      }

      request.payload = {
        address1: 'New address 1',
        address2: '',
        city: 'Sandford',
        county: '',
        postcode: 'SK22 1DL',
        country: 'United Kingdom'
      }
    })

    describe('when a request succeeds', () => {
      describe('and the validation passes', () => {
        test('it redirects to the /business-address-check page', async () => {
          await postBusinessAddressEnter.options.handler(request, h)

          expect(h.redirect).toHaveBeenCalledWith('/business-address-check')
        })

        test('sets the payload on the yar state', async () => {
          await postBusinessAddressEnter.options.handler(request, h)

          expect(setSessionData).toHaveBeenCalledWith(
            request.yar,
            'businessDetails',
            'changeBusinessAddress',
            request.payload
          )
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          err = {
            details: [
              {
                message: 'Postal code or zip code must be 10 characters or less',
                path: ['postcode'],
                type: 'string.max'
              }
            ]
          }
        })

        test('it returns the page successfully with the error summary banner', async () => {
          // Calling the fail action handler
          await postBusinessAddressEnter.options.validate.failAction(request, h, err)

          expect(h.view).toHaveBeenCalledWith('business/business-address-enter', getPageDataError())
        })

        test('it should handle undefined errors', async () => {
          // Calling the fail action handler
          await postBusinessAddressEnter.options.validate.failAction(request, h, [])

          const pageData = getPageDataError()
          pageData.errors = {}

          expect(h.view).toHaveBeenCalledWith('business/business-address-enter', pageData)
        })
      })
    })
  })
})

const getMockData = () => {
  return {
    address: {
      manual: {
        line1: '10 Skirbeck Way',
        line2: '',
        line4: 'Maidstone',
        line5: ''
      },
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
    backLink: { href: '/business-details' },
    pageTitle: 'Enter your business address',
    metaDescription: 'Enter the address for your business.',
    address: {
      address1: '10 Skirbeck Way',
      address2: '',
      city: 'Maidstone',
      county: '',
      postcode: 'SK22 1DL',
      country: 'United Kingdom'
    },
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'Enter your business address',
    metaDescription: 'Enter the address for your business.',
    address: {
      address1: 'New address 1',
      address2: '',
      city: 'Sandford',
      county: '',
      postcode: 'SK22 1DL',
      country: 'United Kingdom'
    },
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    errors: {
      postcode: {
        text: 'Postal code or zip code must be 10 characters or less'
      }
    }
  }
}
