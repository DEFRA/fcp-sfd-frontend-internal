// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { services } from '@defra/fcp-sfd-frontend-engine'
import { personalFixPresenter } from '../../../../src/presenters/personal/personal-fix-presenter.js'
import { fetchPersonalFixService } from '../../../../src/services/fetch-personal-fix-service.js'

// Thing under test
import { personalFixRoutes } from '../../../../src/routes/customer/personal-fix-routes.js'
const [getPersonalFix, postPersonalFix] = personalFixRoutes

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  services: {
    initialiseFixJourney: vi.fn()
  }
}))

vi.mock('../../../../src/presenters/personal/personal-fix-presenter.js', () => ({
  personalFixPresenter: vi.fn()
}))

vi.mock('../../../../src/services/fetch-personal-fix-service.js', () => ({
  fetchPersonalFixService: vi.fn()
}))

describe('personal fix routes', () => {
  let request
  let h

  const crn = '987654321'
  const email = 'test@example.com'

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn },
      yar: {},
      query: { source: 'name' },
      auth: { credentials: { email } }
    }
  })

  describe('GET /customer/{crn}/details/fix', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        services.initialiseFixJourney.mockReturnValue(getMockSessionData())
        fetchPersonalFixService.mockResolvedValue('personal details')
        personalFixPresenter.mockReturnValue(getPageData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalFix.method).toBe('GET')
        expect(getPersonalFix.path).toBe('/customer/{crn}/details/fix')
      })

      test('should have a pre-handler to validate the crn', () => {
        expect(getPersonalFix.options.pre).toHaveLength(1)
      })

      test('it initialises the personal fix journey using the session and source', async () => {
        await getPersonalFix.handler(request, h)

        expect(services.initialiseFixJourney).toHaveBeenCalledWith(request.yar, request.query.source, 'personal')
      })

      test('it fetches personal fix data using the crn, email and session data', async () => {
        await getPersonalFix.handler(request, h)

        expect(fetchPersonalFixService).toHaveBeenCalledWith(crn, email, getMockSessionData())
      })

      test('it presents the personal details using the personalFixPresenter', async () => {
        await getPersonalFix.handler(request, h)

        expect(personalFixPresenter).toHaveBeenCalledWith('personal details', crn)
      })

      test('it renders the personal-fix view with page data', async () => {
        await getPersonalFix.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-fix.njk', getPageData())
      })
    })
  })

  describe('POST /customer/{crn}/details/fix', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn()
      }
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalFix.method).toBe('POST')
      expect(postPersonalFix.path).toBe('/customer/{crn}/details/fix')
    })

    test('should have a pre-handler to validate the crn', () => {
      expect(postPersonalFix.options.pre).toHaveLength(1)
    })

    test('it redirects to the personal fix list page', async () => {
      await postPersonalFix.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith(`/customer/${crn}/details/fix-list`)
    })
  })
})

const getMockSessionData = () => {
  return {
    source: 'name',
    orderedSectionsToFix: ['name', 'email']
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/customer/987654321/details' },
    pageTitle: 'Update your personal details',
    metaDescription: 'Update your personal details.',
    updateText: 'We will ask you to update your personal email address as well as your personal name.',
    listOfErrors: []
  }
}
