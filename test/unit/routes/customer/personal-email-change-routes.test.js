// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalEmailChangeRoutes } from '../../../../src/routes/customer/personal-email-change-routes.js'
const [getPersonalEmailChange, postPersonalEmailChange] = personalEmailChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal email change', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn: '1234567890' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: {},
      payload: {}
    }

    const responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => responseStub)
    }
  })

  describe('GET /customer/{crn}/account-email-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalEmailChange.method).toBe('GET')
        expect(getPersonalEmailChange.path).toBe('/customer/{crn}/account-email-change')
      })

      test('it calls fetchPersonalChangeService', async () => {
        await getPersonalEmailChange.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalEmail')
      })

      test('should render personal-email-change view with page data', async () => {
        await getPersonalEmailChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-email-change', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalEmailChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-email-change', () => {
    beforeEach(() => {
      request.payload = { personalEmail: 'new-email@test.com' }

      fetchPersonalChangeService.mockResolvedValue({ ...getMockData(), changePersonalEmail: request.payload.personalEmail })
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalEmailChange.method).toBe('POST')
      expect(postPersonalEmailChange.path).toBe('/customer/{crn}/account-email-change')
    })

    describe('and the validation passes', () => {
      test('it sets the session data and redirects to the check page', async () => {
        await postPersonalEmailChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalEmail',
          request.payload.personalEmail
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-email-check')
      })
    })

    describe('and the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Enter a personal email address',
              path: ['personalEmail'],
              type: 'string.empty'
            }
          ]
        }
      })

      test('it fetches the personal details', async () => {
        await postPersonalEmailChange.options.validate.failAction(request, h, err)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalEmail'
        )
      })

      test('it returns the page successfully with the error summary banner', async () => {
        await postPersonalEmailChange.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('personal/personal-email-change', getPageDataError())
      })

      test('it should handle undefined errors', async () => {
        await postPersonalEmailChange.options.validate.failAction(request, h, [])

        const pageData = getPageDataError()
        pageData.errors = {}

        expect(h.view).toHaveBeenCalledWith('personal/personal-email-change', pageData)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      userName: 'John Doe',
      fullName: {
        first: 'John',
        last: 'Doe'
      }
    },
    contact: {
      email: 'new-email@test.com'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your personal email address?',
    metaDescription: 'Update the email address for your personal account.',
    userName: 'John Doe',
    personalEmail: 'new-email@test.com'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your personal email address?',
    metaDescription: 'Update the email address for your personal account.',
    userName: 'John Doe',
    personalEmail: 'new-email@test.com',
    errors: {
      personalEmail: {
        text: 'Enter a personal email address'
      }
    }
  }
}
