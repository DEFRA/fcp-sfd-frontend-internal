// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalPhoneNumbersChangeRoutes } from '../../../../src/routes/customer/personal-phone-numbers-change-routes.js'
const [getPersonalPhoneNumbersChange, postPersonalPhoneNumbersChange] = personalPhoneNumbersChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal phone numbers change', () => {
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

  describe('GET /customer/{crn}/account-phone-numbers-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalPhoneNumbersChange.method).toBe('GET')
        expect(getPersonalPhoneNumbersChange.path).toBe('/customer/{crn}/account-phone-numbers-change')
      })

      test('it calls fetchPersonalChangeService', async () => {
        await getPersonalPhoneNumbersChange.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalPhoneNumbers')
      })

      test('should render personal-phone-numbers-change view with page data', async () => {
        await getPersonalPhoneNumbersChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-phone-numbers-change', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalPhoneNumbersChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-phone-numbers-change', () => {
    beforeEach(() => {
      request.payload = { personalTelephone: '01234567890', personalMobile: '07123456789' }

      fetchPersonalChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalPhoneNumbersChange.method).toBe('POST')
      expect(postPersonalPhoneNumbersChange.path).toBe('/customer/{crn}/account-phone-numbers-change')
    })

    describe('and the validation passes', () => {
      test('it sets the session data and redirects to the check page', async () => {
        await postPersonalPhoneNumbersChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalPhoneNumbers',
          { personalTelephone: '01234567890', personalMobile: '07123456789' }
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-phone-numbers-check')
      })

      test('it defaults missing numbers to null', async () => {
        request.payload = { personalTelephone: '01234567890' }

        await postPersonalPhoneNumbersChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalPhoneNumbers',
          { personalTelephone: '01234567890', personalMobile: null }
        )
      })

      test('it defaults a missing telephone to null', async () => {
        request.payload = { personalMobile: '07123456789' }

        await postPersonalPhoneNumbersChange.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalPhoneNumbers',
          { personalTelephone: null, personalMobile: '07123456789' }
        )
      })
    })

    describe('and the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Personal telephone number must be 10 characters or more',
              path: ['personalTelephone'],
              type: 'string.min'
            }
          ]
        }
      })

      test('it fetches the personal details', async () => {
        await postPersonalPhoneNumbersChange.options.validate.failAction(request, h, err)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalPhoneNumbers'
        )
      })

      test('it returns the page successfully with the error summary banner', async () => {
        await postPersonalPhoneNumbersChange.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('personal/personal-phone-numbers-change', getPageDataError())
      })

      test('it should handle undefined errors', async () => {
        await postPersonalPhoneNumbersChange.options.validate.failAction(request, h, [])

        const pageData = getPageDataError()
        pageData.errors = {}

        expect(h.view).toHaveBeenCalledWith('personal/personal-phone-numbers-change', pageData)
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
      telephone: '01111111111',
      mobile: '02222222222'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What are your personal phone numbers?',
    metaDescription: 'Update the phone numbers for your personal account.',
    userName: 'John Doe',
    personalTelephone: '01111111111',
    personalMobile: '02222222222'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/customer/1234567890/details' },
    pageTitle: 'What are your personal phone numbers?',
    metaDescription: 'Update the phone numbers for your personal account.',
    userName: 'John Doe',
    personalTelephone: '01234567890',
    personalMobile: '07123456789',
    errors: {
      personalTelephone: {
        text: 'Personal telephone number must be 10 characters or more'
      }
    }
  }
}
