// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchCrnSearchDetailsService } from '../../../../src/services/search/fetch-crn-search-details-service.js'
import { searchCrnPresenter } from '../../../../src/presenters/search/search-crn-presenter.js'

// Test helpers
import { BAD_REQUEST } from '../../../../src/constants/status-codes.js'

// Thing under test
import { searchCrnRoutes } from '../../../../src/routes/search/search-crn-routes.js'
const [getSearchCrn, postSearchCrn] = searchCrnRoutes

const { mockValidate, mockFormatValidationErrors } = vi.hoisted(() => ({
  mockValidate: vi.fn(),
  mockFormatValidationErrors: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: {
    customer: {
      crn: {
        validate: mockValidate
      }
    }
  },
  utils: {
    formatValidationErrors: mockFormatValidationErrors
  }
}))

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
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      },
      auth: {
        credentials: {
          email: 'test@example.com'
        }
      },
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

    describe('when no CRN is in session', () => {
      beforeEach(() => {
        request.yar.get.mockReturnValue(undefined)
      })

      test('it renders the search page with no page data', async () => {
        await getSearchCrn.handler(request, h)

        expect(request.yar.get).toHaveBeenCalledWith('searchCrn')
        expect(h.view).toHaveBeenCalledWith('search/search-crn')
        expect(fetchCrnSearchDetailsService).not.toHaveBeenCalled()
        expect(searchCrnPresenter).not.toHaveBeenCalled()
        expect(request.yar.clear).not.toHaveBeenCalled()
      })
    })

    describe('when a CRN is in session', () => {
      const searchState = { crn: '1234567890' }
      const details = { info: { customerName: 'Jane Smith' } }
      const pageData = { resultText: '1 result for "1234567890"' }

      beforeEach(() => {
        request.yar.get.mockReturnValue(searchState)
        fetchCrnSearchDetailsService.mockResolvedValue(details)
        searchCrnPresenter.mockReturnValue(pageData)
      })

      test('it fetches details, presents them and clears session state', async () => {
        await getSearchCrn.handler(request, h)

        expect(request.yar.get).toHaveBeenCalledWith('searchCrn')
        expect(fetchCrnSearchDetailsService).toHaveBeenCalledWith('1234567890', 'test@example.com')
        expect(searchCrnPresenter).toHaveBeenCalledWith(details, '1234567890')
        expect(request.yar.clear).toHaveBeenCalledWith('searchCrn')
        expect(h.view).toHaveBeenCalledWith('search/search-crn', pageData)
      })
    })
  })

  describe('POST /search-crn', () => {
    test('should have the correct method and path configured', () => {
      expect(postSearchCrn.method).toBe('POST')
      expect(postSearchCrn.path).toBe('/search-crn')
    })

    describe('when the submitted CRN is empty after trimming', () => {
      beforeEach(() => {
        request.payload = { crn: '   ' }
      })

      test('it redirects back to /search-crn without validating', async () => {
        await postSearchCrn.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(mockValidate).not.toHaveBeenCalled()
        expect(request.yar.set).not.toHaveBeenCalled()
      })
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
        mockValidate.mockReturnValue({ error: validationError })
        mockFormatValidationErrors.mockReturnValue({
          crn: {
            text: 'Enter the full CRN'
          }
        })
      })

      test('it renders the view with formatted errors and bad request status', async () => {
        await postSearchCrn.handler(request, h)

        expect(mockValidate).toHaveBeenCalledWith({ crn: 'abc123' })
        expect(mockFormatValidationErrors).toHaveBeenCalledWith(validationError.details)
        expect(h.view).toHaveBeenCalledWith('search/search-crn', {
          crn: 'abc123',
          errors: {
            crn: {
              text: 'Enter the full CRN'
            }
          },
          showClear: true
        })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(request.yar.set).not.toHaveBeenCalled()
      })
    })

    describe('when validation succeeds', () => {
      beforeEach(() => {
        request.payload = { crn: ' 1234567890 ' }
        mockValidate.mockReturnValue({ value: { crn: '1234567890' } })
      })

      test('it trims input, stores CRN in session and redirects', async () => {
        await postSearchCrn.handler(request, h)

        expect(mockValidate).toHaveBeenCalledWith({ crn: '1234567890' })
        expect(request.yar.set).toHaveBeenCalledWith('searchCrn', { crn: '1234567890' })
        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })
    })
  })
})
