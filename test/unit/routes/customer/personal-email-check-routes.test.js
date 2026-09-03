// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { updatePersonalEmailChangeService } from '../../../../src/services/personal/update-personal-email-change-service.js'

// Thing under test
import { personalEmailCheckRoutes } from '../../../../src/routes/customer/personal-email-check-routes.js'
const [getPersonalEmailCheck, postPersonalEmailCheck] = personalEmailCheckRoutes

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-email-change-service.js', () => ({
  updatePersonalEmailChangeService: vi.fn()
}))

describe('personal email check', () => {
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

  describe('GET /customer/{crn}/account-email-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({}),
          redirect: vi.fn()
        }

        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalEmailCheck.method).toBe('GET')
        expect(getPersonalEmailCheck.path).toBe('/customer/{crn}/account-email-check')
      })

      test('it fetches the data from the session', async () => {
        await getPersonalEmailCheck.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalEmail')
      })

      test('should render personal-email-check view with page data', async () => {
        await getPersonalEmailCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-email-check', getPageData())
      })
    })
  })

  describe('POST /customer/{crn}/account-email-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalEmailCheck.method).toBe('POST')
      expect(postPersonalEmailCheck.path).toBe('/customer/{crn}/account-email-check')
    })

    test('it calls updatePersonalEmailChangeService with yar, crn and email', async () => {
      await postPersonalEmailCheck.handler(request, h)

      expect(updatePersonalEmailChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com')
    })

    test('it redirects to the customer details page', async () => {
      await postPersonalEmailCheck.handler(request, h)

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
      email: 'test@example.com'
    }
  }
}

const getPageData = () => {
  return {
    backLink: '/customer/1234567890/account-email-change',
    changeLink: '/customer/1234567890/account-email-change',
    pageTitle: 'Check your personal email address is correct before submitting',
    metaDescription: 'Check the email address for your personal account is correct.',
    userName: 'John Doe',
    crn: '1234567890',
    personalEmail: 'test@example.com'
  }
}
