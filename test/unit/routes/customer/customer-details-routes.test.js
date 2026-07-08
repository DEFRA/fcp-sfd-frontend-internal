// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mocks
import { fetchPersonalDetailsService } from '../../../../src/services/fetch-personal-details-service.js'
import { validatePersonalDetailsService } from '../../../../src/services/personal/validate-personal-details-service.js'
import { personalDetailsPresenter } from '../../../../src/presenters/personal-details-presenter.js'

// Thing under test
import { customerDetailsRoutes } from '../../../../src/routes/customer/customer-details-routes.js'

const [getCustomerDetails] = customerDetailsRoutes

// Mocks
vi.mock('../../../../src/services/fetch-personal-details-service.js', () => ({
  fetchPersonalDetailsService: vi.fn()
}))

vi.mock('../../../../src/presenters/personal-details-presenter.js', () => ({
  personalDetailsPresenter: vi.fn()
}))

vi.mock('../../../../src/services/personal/validate-personal-details-service.js', () => ({
  validatePersonalDetailsService: vi.fn()
}))

describe('customer details', () => {
  let h
  let request
  let pageData
  let personalDetails

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /customer/{crn}/details', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        request = {
          params: {
            crn: '1234567890'
          },
          auth: {
            credentials: {
              email: 'test@example.com'
            }
          },
          yar: {
            get: vi.fn(),
            set: vi.fn()
          }
        }

        personalDetails = getMockPersonalDetails()
        pageData = getMockPageData()

        fetchPersonalDetailsService.mockResolvedValue(personalDetails)
        validatePersonalDetailsService.mockReturnValue({ hasValidPersonalDetails: true, sectionsNeedingUpdate: [] })
        personalDetailsPresenter.mockReturnValue(pageData)
      })

      test('it has the correct method and path configured', () => {
        expect(getCustomerDetails.method).toBe('GET')
        expect(getCustomerDetails.path).toBe('/customer/{crn}/details')
      })

      test('it fetches details, validates them, presents them and renders the personal details page', async () => {
        await getCustomerDetails.handler(request, h)

        expect(fetchPersonalDetailsService).toHaveBeenCalledWith('1234567890', 'test@example.com')
        expect(validatePersonalDetailsService).toHaveBeenCalledWith(personalDetails)
        expect(personalDetailsPresenter).toHaveBeenCalledWith(personalDetails, request.yar, true, [])
        expect(h.view).toHaveBeenCalledWith('personal/personal-details.njk', pageData)
      })

      test('it passes validation results to the presenter when sections need updating', async () => {
        validatePersonalDetailsService.mockReturnValue({
          hasValidPersonalDetails: false,
          sectionsNeedingUpdate: ['dob', 'address']
        })

        await getCustomerDetails.handler(request, h)

        expect(personalDetailsPresenter).toHaveBeenCalledWith(personalDetails, request.yar, false, ['dob', 'address'])
        expect(h.view).toHaveBeenCalledWith('personal/personal-details.njk', pageData)
      })

      test('bubbles error when fetch service fails and does not render success view', async () => {
        fetchPersonalDetailsService.mockRejectedValue(new Error('Customer personal details not found'))

        await expect(getCustomerDetails.handler(request, h)).rejects.toThrow('Customer personal details not found')

        expect(validatePersonalDetailsService).not.toHaveBeenCalled()
        expect(personalDetailsPresenter).not.toHaveBeenCalled()
        expect(h.view).not.toHaveBeenCalled()
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        h = {
          redirect: vi.fn().mockReturnValue({ takeover: vi.fn().mockReturnThis() }),
          view: vi.fn()
        }

        request = {
          params: {
            crn: 'invalid-crn'
          },
          auth: {
            credentials: {
              email: 'test@example.com'
            }
          },
          yar: {
            get: vi.fn(),
            set: vi.fn()
          }
        }
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
  })
})

const getMockPersonalDetails = () => ({
  crn: '1234567890',
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
})

const getMockPageData = () => ({
  pageTitle: 'View customer personal details',
  userName: 'John Doe',
  crn: '1234567890'
})
