// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalDetailsService } from '../../../../src/services/fetch-personal-details-service.js'
import { validatePersonalDetailsService } from '../../../../src/services/validate-personal-details-service.js'
import { personalDetailsPresenter } from '../../../../src/presenters/personal-details-presenter.js'

// Thing under test
import { customerDetailsRoutes } from '../../../../src/routes/customer/customer-details-routes.js'

const [getCustomerDetails] = customerDetailsRoutes

// Mocks
vi.mock('../../../../src/services/fetch-personal-details-service.js', () => ({
  fetchPersonalDetailsService: vi.fn()
}))

vi.mock('../../../../src/services/validate-personal-details-service.js', () => ({
  validatePersonalDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/personal-details-presenter.js', () => ({
  personalDetailsPresenter: vi.fn()
}))

describe('customer details routes', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: {
        crn: '123456890'
      },
      auth: {
        credentials: {
          email: 'test@example.com'
        }
      }
    }

    h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn().mockReturnThis() })
    }
  })

  describe('GET /customer/{crn}/details', () => {
    test('should have the correct method and path configured', () => {
      expect(getCustomerDetails.method).toBe('GET')
      expect(getCustomerDetails.path).toBe('/customer/{crn}/details')
    })

    describe('when a valid crn is provided', () => {
      const personalDetails = {
        crn: '123456890',
        info: {
          userName: 'John Doe',
          dateOfBirth: { full: '1990-01-01' },
          fullNameJoined: 'John M Doe'
        },
        address: {
          lookup: { uprn: '12345' }
        },
        contact: {
          email: 'test@example.com',
          telephone: '01234567890'
        }
      }

      const validationResult = {
        hasValidPersonalDetails: true,
        sectionsNeedingUpdate: []
      }

      const pageData = {
        pageTitle: 'View customer personal details',
        userName: 'John Doe',
        crn: '123456890'
      }

      beforeEach(() => {
        fetchPersonalDetailsService.mockResolvedValue(personalDetails)
        validatePersonalDetailsService.mockReturnValue(validationResult)
        personalDetailsPresenter.mockReturnValue(pageData)
      })

      test('it fetches details, validates them, presents them and renders the personal details page', async () => {
        await getCustomerDetails.handler(request, h)

        expect(fetchPersonalDetailsService).toHaveBeenCalledWith('123456890', 'test@example.com')
        expect(validatePersonalDetailsService).toHaveBeenCalledWith(personalDetails)
        expect(personalDetailsPresenter).toHaveBeenCalledWith(personalDetails, true, [])
        expect(h.view).toHaveBeenCalledWith('personal/personal-details.njk', pageData)
      })
    })

    describe('when validation identifies sections needing update', () => {
      const personalDetails = {
        crn: '123456890',
        info: {
          userName: 'John Doe',
          dateOfBirth: { full: '' },
          fullNameJoined: 'John Doe'
        },
        address: {
          lookup: {}
        },
        contact: {
          email: 'test@example.com'
        }
      }

      const validationResult = {
        hasValidPersonalDetails: false,
        sectionsNeedingUpdate: ['dob', 'address']
      }

      const pageData = {
        pageTitle: 'View customer personal details',
        userName: 'John Doe',
        crn: '123456890',
        hasErrors: true
      }

      beforeEach(() => {
        fetchPersonalDetailsService.mockResolvedValue(personalDetails)
        validatePersonalDetailsService.mockReturnValue(validationResult)
        personalDetailsPresenter.mockReturnValue(pageData)
      })

      test('it passes validation results to the presenter', async () => {
        await getCustomerDetails.handler(request, h)

        expect(personalDetailsPresenter).toHaveBeenCalledWith(personalDetails, false, ['dob', 'address'])
        expect(h.view).toHaveBeenCalledWith('personal/personal-details.njk', pageData)
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page', async () => {
        await getCustomerDetails.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })

      test('it does not call the service, validator, presenter or render a view', async () => {
        await getCustomerDetails.handler(request, h)

        expect(fetchPersonalDetailsService).not.toHaveBeenCalled()
        expect(validatePersonalDetailsService).not.toHaveBeenCalled()
        expect(personalDetailsPresenter).not.toHaveBeenCalled()
        expect(h.view).not.toHaveBeenCalled()
      })
    })

    describe('when fetchPersonalDetailsService throws', () => {
      const serviceError = new Error('Customer personal details not found')

      beforeEach(() => {
        fetchPersonalDetailsService.mockRejectedValue(serviceError)
      })

      test('it throws the error from the service', async () => {
        const handler = getCustomerDetails.handler(request, h)

        await expect(handler).rejects.toThrow('Customer personal details not found')
      })

      test('the validator, presenter and view are not called', async () => {
        const handler = getCustomerDetails.handler(request, h)

        await expect(handler).rejects.toThrow()

        expect(validatePersonalDetailsService).not.toHaveBeenCalled()
        expect(personalDetailsPresenter).not.toHaveBeenCalled()
        expect(h.view).not.toHaveBeenCalled()
      })
    })
  })
})
