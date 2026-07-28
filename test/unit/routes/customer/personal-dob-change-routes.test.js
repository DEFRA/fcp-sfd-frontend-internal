// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalDobChangeRoutes } from '../../../../src/routes/customer/personal-dob-change-routes.js'
const [getPersonalDobChange, postPersonalDobChange] = personalDobChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal date of birth change', () => {
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

  describe('GET /customer/{crn}/account-date-of-birth-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalDobChange.method).toBe('GET')
        expect(getPersonalDobChange.path).toBe('/customer/{crn}/account-date-of-birth-change')
      })

      test('it calls fetchPersonalChangeService', async () => {
        await getPersonalDobChange.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalDob')
      })

      test('should render personal-dob-change view with page data', async () => {
        await getPersonalDobChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-dob-change', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalDobChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-date-of-birth-change', () => {
    beforeEach(() => {
      request.payload = { day: '7', month: '9', year: '1985' }

      fetchPersonalChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalDobChange.method).toBe('POST')
      expect(postPersonalDobChange.path).toBe('/customer/{crn}/account-date-of-birth-change')
    })

    describe('and the validation passes', () => {
      test('it sets the session data and redirects to the check page', async () => {
        await postPersonalDobChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalDob',
          { day: '7', month: '9', year: '1985' }
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-date-of-birth-check')
      })
    })

    describe('and the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Date of birth must include a day',
              path: ['day'],
              type: 'dob.missingDay'
            }
          ]
        }
      })

      test('it fetches the personal details', async () => {
        await postPersonalDobChange.options.validate.failAction(request, h, err)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalDob'
        )
      })

      test('it returns the page successfully with the error summary banner', async () => {
        await postPersonalDobChange.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('personal/personal-dob-change', getPageDataError())
      })

      test('it should handle undefined errors', async () => {
        await postPersonalDobChange.options.validate.failAction(request, h, [])

        const pageData = getPageDataError()
        pageData.errors = {}

        expect(h.view).toHaveBeenCalledWith('personal/personal-dob-change', pageData)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      dateOfBirth: {
        full: '1982-07-05',
        day: '5',
        month: '7',
        year: '1982'
      },
      userName: 'John Doe',
      fullName: {
        first: 'John',
        last: 'Doe'
      }
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your date of birth?',
    metaDescription: 'Update the date of birth for your personal account.',
    userName: 'John Doe',
    hint: 'For example, 31 3 1980',
    day: '5',
    month: '7',
    year: '1982'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What is your date of birth?',
    metaDescription: 'Update the date of birth for your personal account.',
    userName: 'John Doe',
    hint: 'For example, 31 3 1980',
    day: '7',
    month: '9',
    year: '1985',
    errors: {
      day: {
        text: 'Date of birth must include a day'
      }
    }
  }
}
