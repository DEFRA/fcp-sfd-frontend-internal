// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchSbiSearchDetailsService } from '../../../../src/services/search/fetch-sbi-search-details-service.js'
import { searchSbiPresenter } from '../../../../src/presenters/search/search-sbi-presenter.js'

// Test helpers
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { searchSbiRoutes } from '../../../../src/routes/search/search-sbi-routes.js'
const [getSearchSbi, postSearchSbi] = searchSbiRoutes

const { mockFormatValidationErrors } = vi.hoisted(() => ({
  mockFormatValidationErrors: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    schemas: {
      business: {
        sbi: 'sbi-schema'
      }
    },
    utils: {
      formatValidationErrors: mockFormatValidationErrors
    }
  }
})

// Mocks
vi.mock('../../../../src/services/search/fetch-sbi-search-details-service.js', () => ({
  fetchSbiSearchDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/search/search-sbi-presenter.js', () => ({
  searchSbiPresenter: vi.fn()
}))

describe('search sbi routes', () => {
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
        sbi: '106705779'
      }
    }

    h = {
      view: vi.fn(() => responseStub),
      redirect: vi.fn()
    }
  })

  describe('GET /search-sbi', () => {
    test('should have the correct method and path configured', () => {
      expect(getSearchSbi.method).toBe('GET')
      expect(getSearchSbi.path).toBe('/search-sbi')
    })

    test('validates the sbi query param against the sbi schema', () => {
      expect(getSearchSbi.options.validate.query).toBe('sbi-schema')
    })

    test('failAction renders the search page with a bad request status', () => {
      const result = getSearchSbi.options.validate.failAction(request, h)

      expect(h.view).toHaveBeenCalledWith('search/search-sbi')
      expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
      expect(responseStub.takeover).toHaveBeenCalled()
      expect(result).toBe(responseStub)
    })

    describe('when no SBI is in the query', () => {
      test('it renders the search page with no page data', async () => {
        await getSearchSbi.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('search/search-sbi')
        expect(fetchSbiSearchDetailsService).not.toHaveBeenCalled()
        expect(searchSbiPresenter).not.toHaveBeenCalled()
      })
    })

    describe('when an SBI is in the query', () => {
      const details = { info: { businessName: 'Herberts Lawn Mowing' } }
      const pageData = { resultText: '1 result for "106705779"' }

      beforeEach(() => {
        request.query = { sbi: '106705779' }
        fetchSbiSearchDetailsService.mockResolvedValue(details)
        searchSbiPresenter.mockReturnValue(pageData)
      })

      test('it fetches details and presents them', async () => {
        await getSearchSbi.handler(request, h)

        expect(fetchSbiSearchDetailsService).toHaveBeenCalledWith('106705779', 'test@example.com')
        expect(searchSbiPresenter).toHaveBeenCalledWith(details, '106705779')
        expect(h.view).toHaveBeenCalledWith('search/search-sbi', pageData)
      })
    })
  })

  describe('POST /search-sbi', () => {
    test('should have the correct method and path configured', () => {
      expect(postSearchSbi.method).toBe('POST')
      expect(postSearchSbi.path).toBe('/search-sbi')
    })

    test('validates the sbi payload against the sbi schema', () => {
      expect(postSearchSbi.options.validate.payload).toBe('sbi-schema')
    })

    describe('when validation fails', () => {
      const validationError = {
        details: [
          {
            message: 'SBI must be 9 digits',
            path: ['sbi'],
            type: 'string.pattern.base'
          }
        ]
      }

      beforeEach(() => {
        request.payload = { sbi: 'abc123' }
        mockFormatValidationErrors.mockReturnValue({
          sbi: {
            text: 'SBI must be 9 digits'
          }
        })
      })

      test('it renders the view with formatted errors and bad request status', () => {
        const result = postSearchSbi.options.validate.failAction(request, h, validationError)

        expect(mockFormatValidationErrors).toHaveBeenCalledWith(validationError.details)
        expect(h.view).toHaveBeenCalledWith('search/search-sbi', {
          sbi: 'abc123',
          errors: {
            sbi: {
              text: 'SBI must be 9 digits'
            }
          },
          showClear: true,
          clearSearchLink: '/search-sbi'
        })
        expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(result).toBe(responseStub)
      })
    })

    describe('when the submitted SBI is empty', () => {
      beforeEach(() => {
        request.payload = { sbi: '' }
      })

      test('it redirects back to /search-sbi', async () => {
        await postSearchSbi.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when a valid SBI is submitted', () => {
      beforeEach(() => {
        request.payload = { sbi: '106705779' }
      })

      test('it redirects with the SBI as a query param', async () => {
        await postSearchSbi.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi?sbi=106705779')
      })
    })
  })
})
