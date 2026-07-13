// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Test helpers
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { changeSearchCriteriaRoutes } from '../../../../src/routes/search/change-search-criteria-routes.js'
const [getChangeSearchCriteria, postChangeSearchCriteria] = changeSearchCriteriaRoutes

describe('change search criteria routes', () => {
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
      payload: {}
    }

    h = {
      view: vi.fn(() => responseStub),
      redirect: vi.fn()
    }
  })

  describe('GET /change-search-criteria', () => {
    test('should have the correct method and path configured', () => {
      expect(getChangeSearchCriteria.method).toBe('GET')
      expect(getChangeSearchCriteria.path).toBe('/change-search-criteria')
    })

    test('it renders the search criteria page', async () => {
      await getChangeSearchCriteria.handler(request, h)

      expect(h.view).toHaveBeenCalledWith('search/change-search-criteria')
    })
  })

  describe('POST /change-search-criteria', () => {
    test('should have the correct method and path configured', () => {
      expect(postChangeSearchCriteria.method).toBe('POST')
      expect(postChangeSearchCriteria.path).toBe('/change-search-criteria')
    })

    describe('when the validation fails', () => {
      let err

      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Select what you want to search by',
              path: ['searchCriteria'],
              type: 'any.required'
            }
          ]
        }
      })

      test('it renders the view with a validation error and bad request status', async () => {
        await postChangeSearchCriteria.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('search/change-search-criteria', {
          errors: {
            searchCriteria: {
              text: 'Select what you want to search by'
            }
          }
        })
        expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
      })

      test('it should handle undefined errors', async () => {
        await postChangeSearchCriteria.options.validate.failAction(request, h, [])

        expect(h.view).toHaveBeenCalledWith('search/change-search-criteria', {
          errors: {}
        })
        expect(responseStub.code).toHaveBeenCalledWith(constants.statusCodes.BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
      })
    })

    describe('when Single business identifier (SBI) is selected', () => {
      beforeEach(() => {
        request.payload = { searchCriteria: 'sbi' }
      })

      test('it redirects to /search-sbi', async () => {
        await postChangeSearchCriteria.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(h.view).not.toHaveBeenCalled()
      })
    })

    describe('when Customer reference number (CRN) is selected', () => {
      beforeEach(() => {
        request.payload = { searchCriteria: 'crn' }
      })

      test('it redirects to /search-crn', async () => {
        await postChangeSearchCriteria.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(h.view).not.toHaveBeenCalled()
      })
    })
  })
})
