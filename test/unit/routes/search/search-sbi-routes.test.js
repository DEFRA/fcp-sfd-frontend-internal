// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchSbiSearchDetailsService } from '../../../../src/services/search/fetch-sbi-search-details-service.js'
import { searchSbiPresenter } from '../../../../src/presenters/search/search-sbi-presenter.js'

// Test helpers
import { BAD_REQUEST } from '../../../../src/constants/status-codes.js'

// Thing under test
import { searchSbiRoutes } from '../../../../src/routes/search/search-sbi-routes.js'
const [getSearchSbi, postSearchSbi] = searchSbiRoutes

const { mockValidate, mockFormatValidationErrors } = vi.hoisted(() => ({
  mockValidate: vi.fn(),
  mockFormatValidationErrors: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: {
    business: {
      sbi: {
        validate: mockValidate
      }
    }
  },
  utils: {
    formatValidationErrors: mockFormatValidationErrors
  }
}))

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

    describe('when no SBI is in session', () => {
      beforeEach(() => {
        request.yar.get.mockReturnValue(undefined)
      })

      test('it renders the search page with no page data', async () => {
        await getSearchSbi.handler(request, h)

        expect(request.yar.get).toHaveBeenCalledWith('searchSbi')
        expect(h.view).toHaveBeenCalledWith('search/search-sbi')
        expect(fetchSbiSearchDetailsService).not.toHaveBeenCalled()
        expect(searchSbiPresenter).not.toHaveBeenCalled()
        expect(request.yar.clear).not.toHaveBeenCalled()
      })
    })

    describe('when an SBI is in session', () => {
      const searchState = { sbi: '106705779' }
      const details = { info: { businessName: 'Herberts Lawn Mowing' } }
      const pageData = { resultText: '1 result for "106705779"' }

      beforeEach(() => {
        request.yar.get.mockReturnValue(searchState)
        fetchSbiSearchDetailsService.mockResolvedValue(details)
        searchSbiPresenter.mockReturnValue(pageData)
      })

      test('it fetches details, presents them and clears session state', async () => {
        await getSearchSbi.handler(request, h)

        expect(request.yar.get).toHaveBeenCalledWith('searchSbi')
        expect(fetchSbiSearchDetailsService).toHaveBeenCalledWith('106705779', 'test@example.com')
        expect(searchSbiPresenter).toHaveBeenCalledWith(details, '106705779')
        expect(request.yar.clear).toHaveBeenCalledWith('searchSbi')
        expect(h.view).toHaveBeenCalledWith('search/search-sbi', pageData)
      })
    })
  })

  describe('POST /search-sbi', () => {
    test('should have the correct method and path configured', () => {
      expect(postSearchSbi.method).toBe('POST')
      expect(postSearchSbi.path).toBe('/search-sbi')
    })

    describe('when the submitted SBI is empty after trimming', () => {
      beforeEach(() => {
        request.payload = { sbi: '   ' }
      })

      test('it redirects back to /search-sbi without validating', async () => {
        await postSearchSbi.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(mockValidate).not.toHaveBeenCalled()
        expect(request.yar.set).not.toHaveBeenCalled()
      })
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
        mockValidate.mockReturnValue({ error: validationError })
        mockFormatValidationErrors.mockReturnValue({
          sbi: {
            text: 'SBI must be 9 digits'
          }
        })
      })

      test('it renders the view with formatted errors and bad request status', async () => {
        await postSearchSbi.handler(request, h)

        expect(mockValidate).toHaveBeenCalledWith({ sbi: 'abc123' })
        expect(mockFormatValidationErrors).toHaveBeenCalledWith(validationError.details)
        expect(h.view).toHaveBeenCalledWith('search/search-sbi', {
          sbi: 'abc123',
          errors: {
            sbi: {
              text: 'SBI must be 9 digits'
            }
          }
        })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(request.yar.set).not.toHaveBeenCalled()
      })
    })

    describe('when validation succeeds', () => {
      beforeEach(() => {
        request.payload = { sbi: ' 106705779 ' }
        mockValidate.mockReturnValue({ value: { sbi: '106705779' } })
      })

      test('it trims input, stores SBI in session and redirects', async () => {
        await postSearchSbi.handler(request, h)

        expect(mockValidate).toHaveBeenCalledWith({ sbi: '106705779' })
        expect(request.yar.set).toHaveBeenCalledWith('searchSbi', { sbi: '106705779' })
        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })
  })
})
