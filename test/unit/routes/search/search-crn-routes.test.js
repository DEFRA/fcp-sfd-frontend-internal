// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchCrnSearchDetailsService } from '../../../../src/services/search/fetch-crn-search-details-service.js'
import { searchCrnPresenter } from '../../../../src/presenters/search/search-crn-presenter.js'

// Test helpers
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { searchCrnRoutes } from '../../../../src/routes/search/search-crn-routes.js'
const [getSearchCrn, postSearchCrn] = searchCrnRoutes

const { mockFormatValidationErrors } = vi.hoisted(() => ({
  mockFormatValidationErrors: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    schemas: {
      customer: {
        crn: 'crn-schema'
      }
    },
    utils: {
      formatValidationErrors: mockFormatValidationErrors
    }
  }
})

// Mocks
vi.mock('../../../../src/services/search/fetch-crn-search-details-service.js', () => ({
  fetchCrnSearchDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/search/search-crn-presenter.js', () => ({
  searchCrnPresenter: vi.fn()
}))

describe('search crn routes', () => {
  let request
  let h
  let responseStub

  beforeEach(() => {
    vi.clearAllMocks()

    responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    request = {
      auth: {
        credentials: {
          email: 'test@example.com'
        }
      },
      query: {},
      payload: {
        crn: '1234567890'
      }
    }

    h = {
      view: vi.fn(() => responseStub),
      redirect: vi.fn()
    }
  })

  describe('GET /search-crn', () => {
    test('should have the correct method and path configured', () => {
      expect(getSearchCrn.method).toBe('GET')
      expect(getSearchCrn.path).toBe('/search-crn')
    })

    test('validates the crn query param against the crn schema', () => {
      expect(getSearchCrn.options.validate.query).toBe('crn-schema')
    })

    test('failAction renders the search page with a bad request status', () => {
      const result = getSearchCrn.options.validate.failAction(request, h)

      expect(h.view).toHaveBeenCalledWith('search/search-crn')
      expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
      expect(responseStub.takeover).toHaveBeenCalled()
      expect(result).toBe(responseStub)
    })

    describe('when no CRN is in the query', () => {
      test('it renders the search page with no page data', async () => {
        await getSearchCrn.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('search/search-crn')
        expect(fetchCrnSearchDetailsService).not.toHaveBeenCalled()
        expect(searchCrnPresenter).not.toHaveBeenCalled()
      })
    })

    describe('when a CRN is in the query', () => {
      const details = { info: { customerName: 'Jane Smith' } }
      const pageData = { resultText: '1 result for "1234567890"' }

      beforeEach(() => {
        request.query = { crn: '1234567890' }
        fetchCrnSearchDetailsService.mockResolvedValue(details)
        searchCrnPresenter.mockReturnValue(pageData)
      })

      test('it fetches details and presents them', async () => {
        await getSearchCrn.handler(request, h)

        expect(fetchCrnSearchDetailsService).toHaveBeenCalledWith('1234567890', 'test@example.com')
        expect(searchCrnPresenter).toHaveBeenCalledWith(details, '1234567890')
        expect(h.view).toHaveBeenCalledWith('search/search-crn', pageData)
      })
    })
  })

  describe('POST /search-crn', () => {
    test('should have the correct method and path configured', () => {
      expect(postSearchCrn.method).toBe('POST')
      expect(postSearchCrn.path).toBe('/search-crn')
    })

    test('validates the crn payload against the crn schema', () => {
      expect(postSearchCrn.options.validate.payload).toBe('crn-schema')
    })

    describe('when validation fails', () => {
      const validationError = {
        details: [
          {
            message: 'Enter the full CRN',
            path: ['crn'],
            type: 'string.pattern.base'
          }
        ]
      }

      beforeEach(() => {
        request.payload = { crn: 'abc123' }
        mockFormatValidationErrors.mockReturnValue({
          crn: {
            text: 'Enter the full CRN'
          }
        })
      })

      test('it renders the view with formatted errors and bad request status', () => {
        const result = postSearchCrn.options.validate.failAction(request, h, validationError)

        expect(mockFormatValidationErrors).toHaveBeenCalledWith(validationError.details)
        expect(h.view).toHaveBeenCalledWith('search/search-crn', {
          crn: 'abc123',
          errors: {
            crn: {
              text: 'Enter the full CRN'
            }
          },
          showClear: true,
          clearSearchLink: '/search-crn'
        })
        expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(result).toBe(responseStub)
      })
    })

    describe('when the submitted CRN is empty', () => {
      beforeEach(() => {
        request.payload = { crn: '' }
      })

      test('it redirects back to /search-crn', async () => {
        await postSearchCrn.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })
    })

    describe('when a valid CRN is submitted', () => {
      beforeEach(() => {
        request.payload = { crn: '1234567890' }
      })

      test('it redirects with the CRN as a query param', async () => {
        await postSearchCrn.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn?crn=1234567890')
      })
    })
  })
})
