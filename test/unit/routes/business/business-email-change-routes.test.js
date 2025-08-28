// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { businessEmailChangeRoutes } from '../../../../src/routes/business/business-email-change-routes.js'
const [getBusinessEmailChange, postBusinessEmailChange] = businessEmailChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('business email change', () => {
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

  describe('GET /business-email-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessEmailChange.method).toBe('GET')
        expect(getBusinessEmailChange.path).toBe('/business-email-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessEmailChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-email-change.njk view with page data', async () => {
        await getBusinessEmailChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-email-change', getPageData())
      })
    })
  })

  describe('POST /business-email-change', () => {
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

      request.payload = { businessEmail: 'new-email@test.com' }
    })

    describe('when a request succeeds', () => {
      describe('and the validation passes', () => {
        test('it redirects to the /business-email-check page', async () => {
          await postBusinessEmailChange.options.handler(request, h)

          expect(h.redirect).toHaveBeenCalledWith('/business-email-check')
        })

        test('sets the payload on the yar state', async () => {
          await postBusinessEmailChange.options.handler(request, h)

          expect(setSessionData).toHaveBeenCalledWith(
            request.yar,
            'businessDetails',
            'changeBusinessEmail',
            request.payload.businessEmail
          )
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          err = {
            details: [
              {
                message: 'Enter business email address',
                path: ['businessEmail'],
                type: 'string.empty'
              }
            ]
          }
        })

        test('it returns the page successfully with the error summary banner', async () => {
          // Calling the fail action handler
          await postBusinessEmailChange.options.validate.failAction(request, h, err)

          expect(h.view).toHaveBeenCalledWith('business/business-email-change', getPageDataError())
        })

        test('it should handle undefined errors', async () => {
          // Calling the fail action handler
          await postBusinessEmailChange.options.validate.failAction(request, h, [])

          const pageData = getPageDataError()
          pageData.errors = {}

          expect(h.view).toHaveBeenCalledWith('business/business-email-change', pageData)
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
      email: 'new-email@test.com'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    businessEmail: 'new-email@test.com',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    businessEmail: 'new-email@test.com',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    errors: {
      businessEmail: {
        text: 'Enter business email address'
      }
    }
  }
}
