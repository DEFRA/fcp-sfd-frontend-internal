// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalNameChangeRoutes } from '../../../../src/routes/customer/personal-name-change-routes.js'
const [getPersonalNameChange, postPersonalNameChange] = personalNameChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal name change', () => {
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

  describe('GET /customer/{crn}/account-name-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalNameChange.method).toBe('GET')
        expect(getPersonalNameChange.path).toBe('/customer/{crn}/account-name-change')
      })

      test('it fetches the data from the session', async () => {
        await getPersonalNameChange.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalName')
      })

      test('it renders the personal-name-change view with correct page data', async () => {
        await getPersonalNameChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-name-change', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalNameChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-name-change', () => {
    beforeEach(() => {
      request.payload = {
        first: 'John',
        middle: 'A',
        last: 'Doe'
      }

      fetchPersonalChangeService.mockResolvedValue({ ...getMockData(), changePersonalName: request.payload })
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalNameChange.method).toBe('POST')
      expect(postPersonalNameChange.path).toBe('/customer/{crn}/account-name-change')
    })

    describe('and the validation passes', () => {
      test('it sets the session data and redirects to the check page', async () => {
        await postPersonalNameChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalName',
          request.payload
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-name-check')
      })
    })

    describe('and the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Enter first name',
              path: ['first'],
              type: 'string.empty'
            }
          ]
        }
      })

      test('it fetches the personal details', async () => {
        await postPersonalNameChange.options.validate.failAction(request, h, err)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalName'
        )
      })

      test('it returns the page successfully with the error summary banner', async () => {
        await postPersonalNameChange.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('personal/personal-name-change', getPageDataError())
      })

      test('it should handle undefined errors', async () => {
        await postPersonalNameChange.options.validate.failAction(request, h, [])

        const pageData = getPageDataError()
        pageData.errors = {}

        expect(h.view).toHaveBeenCalledWith('personal/personal-name-change', pageData)
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
        middle: 'M',
        last: 'Doe'
      }
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your full name?',
    metaDescription: 'Update the full name for your personal account.',
    userName: 'John Doe',
    first: 'John',
    middle: 'M',
    last: 'Doe'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your full name?',
    metaDescription: 'Update the full name for your personal account.',
    userName: 'John Doe',
    first: 'John',
    middle: 'A',
    last: 'Doe',
    errors: {
      first: {
        text: 'Enter first name'
      }
    }
  }
}
