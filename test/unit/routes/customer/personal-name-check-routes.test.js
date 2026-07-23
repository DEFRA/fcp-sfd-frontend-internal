// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { updatePersonalNameChangeService } from '../../../../src/services/personal/update-personal-name-change-service.js'

// Thing under test
import { personalNameCheckRoutes } from '../../../../src/routes/customer/personal-name-check-routes.js'
const [getPersonalNameCheck, postPersonalNameCheck] = personalNameCheckRoutes

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-name-change-service.js', () => ({
  updatePersonalNameChangeService: vi.fn()
}))

describe('personal name check', () => {
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

  describe('GET /customer/{crn}/account-name-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({}),
          redirect: vi.fn()
        }

        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalNameCheck.method).toBe('GET')
        expect(getPersonalNameCheck.path).toBe('/customer/{crn}/account-name-check')
      })

      test('it fetches the data from the session', async () => {
        await getPersonalNameCheck.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalName')
      })

      test('should render personal-name-check view with page data', async () => {
        await getPersonalNameCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-name-check', getPageData())
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
        await getPersonalNameCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-name-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalNameCheck.method).toBe('POST')
      expect(postPersonalNameCheck.path).toBe('/customer/{crn}/account-name-check')
    })

    test('it calls updatePersonalNameChangeService with yar, crn and email', async () => {
      await postPersonalNameCheck.handler(request, h)

      expect(updatePersonalNameChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com')
    })

    test('it redirects to the customer details page', async () => {
      await postPersonalNameCheck.handler(request, h)

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
        middle: 'M',
        last: 'Doe'
      }
    },
    changePersonalName: {
      first: 'Jane',
      middle: 'A',
      last: 'Smith'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/1234567890/account-name-change' },
    changeLink: '/customer/1234567890/account-name-change',
    pageTitle: 'Check your name is correct before submitting',
    metaDescription: 'Check the full name for your personal account is correct.',
    userName: 'John Doe',
    fullName: 'Jane A Smith'
  }
}
