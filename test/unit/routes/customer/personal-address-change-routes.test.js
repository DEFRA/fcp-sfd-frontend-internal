// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { addressLookupService } from '../../../../src/services/os-places/address-lookup-service.js'
import { personalAddressChangeErrorService } from '../../../../src/services/personal/personal-address-change-error-service.js'

// Thing under test
import { personalAddressChangeRoutes } from '../../../../src/routes/customer/personal-address-change-routes.js'
const [getPersonalAddressChange, postPersonalAddressChange] = personalAddressChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/os-places/address-lookup-service.js', () => ({
  addressLookupService: vi.fn()
}))

vi.mock('../../../../src/services/personal/personal-address-change-error-service.js', () => ({
  personalAddressChangeErrorService: vi.fn()
}))

describe('personal address change', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn: '1234567890' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: {},
      payload: {}
    }

    const responseStub = {
      code: vi.fn().mockReturnThis(),
      takeover: vi.fn().mockReturnThis()
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => responseStub)
    }
  })

  describe('GET /customer/{crn}/account-address-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalAddressChange.method).toBe('GET')
        expect(getPersonalAddressChange.path).toBe('/customer/{crn}/account-address-change')
      })

      test('it calls fetchPersonalChangeService with crn, email, and changePersonalPostcode', async () => {
        await getPersonalAddressChange.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(request.yar, '1234567890', 'test@example.com', 'changePersonalPostcode')
      })

      test('should render personal-address-change view with page data', async () => {
        await getPersonalAddressChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-address-change', getPageData())
      })
    })

    describe('when the crn fails validation', () => {
      beforeEach(() => {
        request.params.crn = 'invalid-crn'
      })

      test('it redirects to the search-crn page and does not fetch data', async () => {
        await getPersonalAddressChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(fetchPersonalChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /customer/{crn}/account-address-change', () => {
    beforeEach(() => {
      request.payload = { postcode: 'SW1A 1AA' }
      fetchPersonalChangeService.mockResolvedValue(getMockData())
      addressLookupService.mockResolvedValue([{ uprn: '1001', displayAddress: '123 Test Street' }])
      personalAddressChangeErrorService.mockResolvedValue(getErrorPageData())
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalAddressChange.method).toBe('POST')
      expect(postPersonalAddressChange.path).toBe('/customer/{crn}/account-address-change')
    })

    describe('and the validation passes', () => {
      test('it sets session data, calls addressLookupService, and redirects to address select', async () => {
        await postPersonalAddressChange.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalPostcode',
          request.payload
        )
        expect(addressLookupService).toHaveBeenCalledWith('SW1A 1AA', request.yar, 'personal')
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-address-select')
      })
    })

    describe('and address lookup returns an error', () => {
      beforeEach(() => {
        addressLookupService.mockResolvedValue({ error: [{ message: 'Postcode not found' }] })
      })

      test('it calls personalAddressChangeErrorService and renders the view with error code', async () => {
        await postPersonalAddressChange.handler(request, h)

        expect(personalAddressChangeErrorService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'SW1A 1AA',
          [{ message: 'Postcode not found' }]
        )
        expect(h.view).toHaveBeenCalledWith('personal/personal-address-change', getErrorPageData())
      })
    })

    describe('and the validation fails', () => {
      test('it calls personalAddressChangeErrorService and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Postcode is required',
              path: ['postcode'],
              type: 'any.required'
            }
          ]
        }

        await postPersonalAddressChange.options.validate.failAction(request, h, validationError)

        expect(personalAddressChangeErrorService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'SW1A 1AA',
          validationError.details
        )
        expect(h.view).toHaveBeenCalledWith('personal/personal-address-change', getErrorPageData())
      })
    })
  })
})

const getMockData = () => ({
  info: { userName: 'John Doe' },
  changePersonalPostcode: { postcode: 'SW1A 1AA' }
})

const getPageData = () => ({
  backLink: { href: '/personal-details' },
  manualAddressLink: '/account-address-enter',
  pageTitle: 'What is your personal address?',
  metaDescription: 'Update the address for your personal account.',
  userName: 'John Doe',
  postcode: 'SW1A 1AA'
})

const getErrorPageData = () => ({
  ...getPageData(),
  errors: {}
})
