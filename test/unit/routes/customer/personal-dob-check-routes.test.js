// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { updatePersonalDobChangeService } from '../../../../src/services/personal/update-personal-dob-change-service.js'

// Thing under test
import { personalDobCheckRoutes } from '../../../../src/routes/customer/personal-dob-check-routes.js'
const [getPersonalDobCheck, postPersonalDobCheck] = personalDobCheckRoutes

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-dob-change-service.js', () => ({
  updatePersonalDobChangeService: vi.fn()
}))

describe('personal date of birth check', () => {
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

  describe('GET /customer/{crn}/account-date-of-birth-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({}),
          redirect: vi.fn()
        }

        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalDobCheck.method).toBe('GET')
        expect(getPersonalDobCheck.path).toBe('/customer/{crn}/account-date-of-birth-check')
      })

      test('it fetches the data from the session', async () => {
        await getPersonalDobCheck.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalDob')
      })

      test('should render personal-dob-check view with page data', async () => {
        await getPersonalDobCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-dob-check', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        h = {
          view: vi.fn(),
          redirect: vi.fn().mockReturnValue({})
        }

        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalDobCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-date-of-birth-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalDobCheck.method).toBe('POST')
      expect(postPersonalDobCheck.path).toBe('/customer/{crn}/account-date-of-birth-check')
    })

    test('it calls updatePersonalDobChangeService with yar, crn and email', async () => {
      await postPersonalDobCheck.handler(request, h)

      expect(updatePersonalDobChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com')
    })

    test('it redirects to the customer details page', async () => {
      await postPersonalDobCheck.handler(request, h)

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
    changePersonalDob: {
      day: '7',
      month: '9',
      year: '1985'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/account-date-of-birth-change' },
    pageTitle: 'Check your date of birth is correct before submitting',
    metaDescription: 'Check the date of birth for your personal account is correct.',
    userName: 'John Doe',
    changeLink: '/customer/1234567890/account-date-of-birth-change',
    dateOfBirth: '7 September 1985'
  }
}
