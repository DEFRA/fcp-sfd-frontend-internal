// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalFixService } from '../../../../src/services/fetch-personal-fix-service.js'
import { updatePersonalFixService } from '../../../../src/services/personal/update-personal-fix-service.js'

// Thing under test
import { personalFixCheckRoutes } from '../../../../src/routes/customer/personal-fix-check-routes.js'
const [getPersonalFixCheck, postPersonalFixCheck] = personalFixCheckRoutes

// Mocks
vi.mock('../../../../src/services/fetch-personal-fix-service.js', () => ({
  fetchPersonalFixService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-fix-service.js', () => ({
  updatePersonalFixService: vi.fn()
}))

describe('personal fix check routes', () => {
  let request
  let h
  let sessionData

  const crn = '987654321'
  const email = 'test@example.com'

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = {
      orderedSectionsToFix: ['name', 'email']
    }

    request = {
      params: { crn },
      yar: {
        get: vi.fn(() => sessionData),
        clear: vi.fn()
      },
      auth: { credentials: { email } }
    }
  })

  describe('GET /customer/{crn}/details/fix-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchPersonalFixService.mockResolvedValue({
          changePersonalName: { first: 'New', last: 'Person' },
          changePersonalEmail: { personalEmail: 'newemail@new.com' },
          orderedSectionsToFix: ['name', 'email']
        })
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalFixCheck.method).toBe('GET')
        expect(getPersonalFixCheck.path).toBe('/customer/{crn}/details/fix-check')
      })

      test('should have a pre-handler to validate the crn and guard the interrupted journey session', () => {
        expect(getPersonalFixCheck.options.pre).toHaveLength(1)
      })

      test('it fetches personal fix data using the crn, email and session data', async () => {
        await getPersonalFixCheck.handler(request, h)

        expect(fetchPersonalFixService).toHaveBeenCalledWith(crn, email, sessionData)
      })

      test('it renders the personal-fix-check view with page data', async () => {
        await getPersonalFixCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-fix-check.njk', getPageData())
      })
    })
  })

  describe('POST /customer/{crn}/details/fix-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn()
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalFixCheck.method).toBe('POST')
      expect(postPersonalFixCheck.path).toBe('/customer/{crn}/details/fix-check')
    })

    test('should have a pre-handler to validate the crn and guard the interrupted journey session', () => {
      expect(postPersonalFixCheck.options.pre).toHaveLength(1)
    })

    test('it calls updatePersonalFixService with the crn, session data, yar and email', async () => {
      await postPersonalFixCheck.handler(request, h)

      expect(updatePersonalFixService).toHaveBeenCalledWith(crn, sessionData, request.yar, email)
    })

    test('it redirects to the customer details page', async () => {
      await postPersonalFixCheck.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith(`/customer/${crn}/details`)
    })
  })
})

const getPageData = () => {
  return {
    backLink: '/customer/987654321/details/fix-list',
    pageTitle: 'Check your details are correct before submitting',
    metaDescription: 'Check your details are correct before submitting',
    changeLink: '/customer/987654321/details/fix-list',
    sections: ['name', 'email'],
    fullName: 'New Person',
    dateOfBirth: null,
    personalEmail: 'newemail@new.com',
    address: null,
    personalTelephone: {
      telephone: null,
      mobile: null
    }
  }
}
