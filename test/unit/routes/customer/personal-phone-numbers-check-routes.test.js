// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { updatePersonalPhoneNumbersChangeService } from '../../../../src/services/personal/update-personal-phone-numbers-change-service.js'

// Thing under test
import { personalPhoneNumbersCheckRoutes } from '../../../../src/routes/customer/personal-phone-numbers-check-routes.js'
const [getPersonalPhoneNumbersCheck, postPersonalPhoneNumbersCheck] = personalPhoneNumbersCheckRoutes

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-phone-numbers-change-service.js', () => ({
  updatePersonalPhoneNumbersChangeService: vi.fn()
}))

describe('personal phone numbers check', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn: '1234567890' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: {}
    }
  })

  describe('GET /customer/{crn}/account-phone-numbers-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({}),
          redirect: vi.fn()
        }

        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalPhoneNumbersCheck.method).toBe('GET')
        expect(getPersonalPhoneNumbersCheck.path).toBe('/customer/{crn}/account-phone-numbers-check')
      })

      test('it fetches the data from the session', async () => {
        await getPersonalPhoneNumbersCheck.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalPhoneNumbers')
      })

      test('should render personal-phone-numbers-check view with page data', async () => {
        await getPersonalPhoneNumbersCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-phone-numbers-check', getPageData())
      })
    })
  })

  describe('POST /customer/{crn}/account-phone-numbers-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalPhoneNumbersCheck.method).toBe('POST')
      expect(postPersonalPhoneNumbersCheck.path).toBe('/customer/{crn}/account-phone-numbers-check')
    })

    test('it calls updatePersonalPhoneNumbersChangeService with yar, crn and email', async () => {
      await postPersonalPhoneNumbersCheck.handler(request, h)

      expect(updatePersonalPhoneNumbersChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com')
    })

    test('it redirects to the customer details page', async () => {
      await postPersonalPhoneNumbersCheck.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/details')
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
    },
    changePersonalPhoneNumbers: {
      personalTelephone: '01234567890',
      personalMobile: '07123456789'
    }
  }
}

const getPageData = () => {
  return {
    backLink: '/customer/1234567890/account-phone-numbers-change',
    changeLink: '/customer/1234567890/account-phone-numbers-change',
    pageTitle: 'Check your personal phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your personal account are correct.',
    userName: 'John Doe',
    crn: '1234567890',
    personalTelephone: {
      telephone: '01234567890',
      mobile: '07123456789'
    }
  }
}
