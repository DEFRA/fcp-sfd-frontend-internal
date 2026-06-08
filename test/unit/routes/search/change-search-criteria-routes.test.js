// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Test helpers
import { BAD_REQUEST } from '../../../../src/constants/status-codes.js'

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
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      },
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

    describe('when no search criteria is in session', () => {
      beforeEach(() => {
        request.yar.get.mockReturnValue(undefined)
      })

      test('it renders the search criteria page with no page data', async () => {
        await getChangeSearchCriteria.handler(request, h)

        expect(request.yar.get).toHaveBeenCalledWith('changeSearchCriteria')
        expect(h.view).toHaveBeenCalledWith('search/change-search-criteria')
        expect(h.redirect).not.toHaveBeenCalled()
        expect(request.yar.clear).not.toHaveBeenCalled()
      })
    })

    describe('when search criteria is in session', () => {
      describe('when the stored criteria is sbi', () => {
        beforeEach(() => {
          request.yar.get.mockReturnValue({ searchCriteria: 'sbi' })
        })

        test('it clears session state and redirects to /search-sbi', async () => {
          await getChangeSearchCriteria.handler(request, h)

          expect(request.yar.clear).toHaveBeenCalledWith('changeSearchCriteria')
          expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
          expect(h.view).not.toHaveBeenCalled()
        })
      })

      describe('when the stored criteria is crn', () => {
        beforeEach(() => {
          request.yar.get.mockReturnValue({ searchCriteria: 'crn' })
        })

        test('it clears session state and redirects to /search-crn', async () => {
          await getChangeSearchCriteria.handler(request, h)

          expect(request.yar.clear).toHaveBeenCalledWith('changeSearchCriteria')
          expect(h.redirect).toHaveBeenCalledWith('/search-crn')
          expect(h.view).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('POST /change-search-criteria', () => {
    test('should have the correct method and path configured', () => {
      expect(postChangeSearchCriteria.method).toBe('POST')
      expect(postChangeSearchCriteria.path).toBe('/change-search-criteria')
    })

    describe('when no option is selected', () => {
      beforeEach(() => {
        request.payload = {}
      })

      test('it renders the view with a validation error and bad request status', async () => {
        await postChangeSearchCriteria.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('search/change-search-criteria', {
          errors: {
            searchCriteria: {
              text: 'Select what you want to search by'
            }
          }
        })
        expect(responseStub.code).toHaveBeenCalledWith(BAD_REQUEST)
        expect(responseStub.takeover).toHaveBeenCalled()
        expect(request.yar.set).not.toHaveBeenCalled()
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })

    describe('when Single business identifier (SBI) is selected', () => {
      beforeEach(() => {
        request.payload = { searchCriteria: 'sbi' }
      })

      test('it stores the criteria in session and redirects to /change-search-criteria', async () => {
        await postChangeSearchCriteria.handler(request, h)

        expect(request.yar.set).toHaveBeenCalledWith('changeSearchCriteria', { searchCriteria: 'sbi' })
        expect(h.redirect).toHaveBeenCalledWith('/change-search-criteria')
        expect(h.view).not.toHaveBeenCalled()
      })
    })

    describe('when Customer reference number (CRN) is selected', () => {
      beforeEach(() => {
        request.payload = { searchCriteria: 'crn' }
      })

      test('it stores the criteria in session and redirects to /change-search-criteria', async () => {
        await postChangeSearchCriteria.handler(request, h)

        expect(request.yar.set).toHaveBeenCalledWith('changeSearchCriteria', { searchCriteria: 'crn' })
        expect(h.redirect).toHaveBeenCalledWith('/change-search-criteria')
        expect(h.view).not.toHaveBeenCalled()
      })
    })
  })
})
