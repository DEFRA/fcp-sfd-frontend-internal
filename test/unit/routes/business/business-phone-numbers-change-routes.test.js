// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { businessPhoneNumbersChangeRoutes } from '../../../../src/routes/business/business-phone-numbers-change-routes.js'
const [getBusinessPhoneNumbersChange, postBusinessPhoneNumbersChange] = businessPhoneNumbersChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('business phone numbers change', () => {
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

  describe('GET /business-phone-numbers-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessPhoneNumbersChange.method).toBe('GET')
        expect(getBusinessPhoneNumbersChange.path).toBe('/business-phone-numbers-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessPhoneNumbersChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-phone-numbers-change.njk view with page data', async () => {
        await getBusinessPhoneNumbersChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', getPageData())
      })
    })
  })

  describe('POST /business-phone-numbers-change', () => {
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

      request.payload = { businessMobile: null, businessTelephone: null }
    })

    describe('when a request succeeds', () => {
      describe('and the validation passes', () => {
        test('it redirects to the /business-phone-numbers-check page', async () => {
          await postBusinessPhoneNumbersChange.options.handler(request, h)

          expect(h.redirect).toHaveBeenCalledWith('/business-phone-numbers-check')
        })

        test('sets the payload on the yar state', async () => {
          await postBusinessPhoneNumbersChange.options.handler(request, h)

          // Ensure it was called twice
          expect(setSessionData).toHaveBeenCalledTimes(2)

          // Check the specific calls
          expect(setSessionData).toHaveBeenNthCalledWith(
            1,
            request.yar,
            'businessDetails',
            'changeBusinessTelephone',
            request.payload.businessTelephone
          )

          expect(setSessionData).toHaveBeenNthCalledWith(
            2,
            request.yar,
            'businessDetails',
            'changeBusinessMobile',
            request.payload.businessMobile
          )
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          err = {
            details: [
              {
                message: 'Business mobile number must be 10 characters or more',
                path: ['businessMobile'],
                type: 'string.min'
              }
            ]
          }
        })

        test('it returns the page successfully with the error summary banner', async () => {
          // Calling the fail action handler
          await postBusinessPhoneNumbersChange.options.validate.failAction(request, h, err)

          expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', getPageDataError())
        })

        test('it should handle undefined errors', async () => {
          // Calling the fail action handler
          await postBusinessPhoneNumbersChange.options.validate.failAction(request, h, [])

          const pageData = getPageDataError()
          pageData.errors = {}

          expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-change', pageData)
        })
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
      mobile: '01234 567891',
      landline: '01111 111111'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What are your business phone numbers?',
    metaDescription: 'Update the phone numbers for your business.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    businessTelephone: '01111 111111',
    businessMobile: '01234 567891'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What are your business phone numbers?',
    metaDescription: 'Update the phone numbers for your business.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    businessTelephone: null,
    businessMobile: null,
    errors: {
      businessMobile: {
        text: 'Business mobile number must be 10 characters or more'
      }
    }
  }
}
