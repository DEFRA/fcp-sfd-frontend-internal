// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { businessNameChangeRoutes } from '../../../../src/routes/business/business-name-change-routes.js'
const [getBusinessNameChange, postBusinessNameChange] = businessNameChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('business name change', () => {
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

  describe('GET /business-name-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessNameChange.method).toBe('GET')
        expect(getBusinessNameChange.path).toBe('/business-name-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessNameChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-name-change view with page data', async () => {
        await getBusinessNameChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-name-change', getPageData())
      })
    })
  })

  describe('POST /business-name-change', () => {
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

      request.payload = { businessName: 'New business Name ltd' }
    })

    describe('when a request succeeds', () => {
      describe('and the validation passes', () => {
        test('it redirects to the /business-name-check page', async () => {
          await postBusinessNameChange.options.handler(request, h)

          expect(h.redirect).toHaveBeenCalledWith('/business-name-check')
        })

        test('sets the payload on the yar state', async () => {
          await postBusinessNameChange.options.handler(request, h)

          expect(setSessionData).toHaveBeenCalledWith(
            request.yar,
            'businessDetails',
            'changeBusinessName',
            request.payload.businessName
          )
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          err = {
            details: [
              {
                message: 'Enter business name',
                path: ['businessName'],
                type: 'string.empty'
              }
            ]
          }
        })

        test('it returns the page successfully with the error summary banner', async () => {
          // Calling the fail action handler
          await postBusinessNameChange.options.validate.failAction(request, h, err)

          expect(h.view).toHaveBeenCalledWith('business/business-name-change', getPageDataError())
        })

        test('it should handle undefined errors', async () => {
          // Calling the fail action handler
          await postBusinessNameChange.options.validate.failAction(request, h, [])

          const pageData = getPageDataError()
          pageData.errors = {}

          expect(h.view).toHaveBeenCalledWith('business/business-name-change', pageData)
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
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    businessName: 'Agile Farm Ltd',
    changeBusinessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    changeBusinessName: 'New business Name ltd',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    errors: {
      businessName: {
        text: 'Enter business name'
      }
    }
  }
}
