// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalAddressSelectRoutes } from '../../../../src/routes/customer/personal-address-select-routes.js'
const [getPersonalAddressSelect, postPersonalAddressSelect] = personalAddressSelectRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal address select', () => {
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
      redirect: vi.fn(() => responseStub),
      view: vi.fn(() => responseStub)
    }
  })

  describe('GET /customer/{crn}/account-address-select', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalAddressSelect.method).toBe('GET')
        expect(getPersonalAddressSelect.path).toBe('/customer/{crn}/account-address-select')
      })

      test('it calls fetchPersonalChangeService with required fields', async () => {
        await getPersonalAddressSelect.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          ['changePersonalPostcode', 'changePersonalAddresses', 'changePersonalAddress']
        )
      })

      test('should render personal-address-select view with page data', async () => {
        await getPersonalAddressSelect.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-address-select', expect.any(Object))
      })
    })

    describe('when the crn fails validation', () => {
      test('the route has a pre-handler to validate crn', () => {
        expect(getPersonalAddressSelect.options.pre).toBeDefined()
        expect(getPersonalAddressSelect.options.pre).toHaveLength(1)
      })
    })

    describe('when required session data is missing', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue({
          changePersonalPostcode: null,
          changePersonalAddresses: [{ uprn: '1001', displayAddress: '123 Test Street' }]
        })
      })

      test('it redirects to the address change page', async () => {
        await getPersonalAddressSelect.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-address-change')
      })
    })
  })

  describe('POST /customer/{crn}/account-address-select', () => {
    beforeEach(() => {
      request.payload = { addresses: '1001123 Test Street' }
      fetchPersonalChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalAddressSelect.method).toBe('POST')
      expect(postPersonalAddressSelect.path).toBe('/customer/{crn}/account-address-select')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postPersonalAddressSelect.options.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalAddresses'
        )
        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalAddress',
          {
            uprn: '1001',
            displayAddress: '123 Test Street',
            postcodeLookup: true
          }
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-address-check')
      })
    })

    describe('and selected address is not found', () => {
      beforeEach(() => {
        request.payload = { addresses: 'invalid-address' }
      })

      test('it redirects back to address select', async () => {
        await postPersonalAddressSelect.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-address-select')
      })
    })

    describe('and the validation fails', () => {
      test('it fetches personal details and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Choose an address',
              path: ['addresses'],
              type: 'any.required'
            }
          ]
        }

        await postPersonalAddressSelect.options.validate.failAction(request, h, validationError)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          ['changePersonalPostcode', 'changePersonalAddresses']
        )
        expect(h.view).toHaveBeenCalledWith('personal/personal-address-select', expect.any(Object))
      })

      test('it returns a BAD_REQUEST status code', async () => {
        const validationError = { details: [] }

        await postPersonalAddressSelect.options.validate.failAction(request, h, validationError)

        expect(h.view).toHaveBeenCalled()
        const responseStub = h.view.mock.results[0].value
        expect(responseStub.code).toHaveBeenCalledWith(400)
      })
    })
  })
})

const getMockData = () => ({
  info: { userName: 'John Doe' },
  changePersonalPostcode: { postcode: 'SW1A 1AA' },
  changePersonalAddresses: [
    { uprn: '1001', displayAddress: '123 Test Street' },
    { uprn: '1002', displayAddress: '124 Test Street' }
  ],
  changePersonalAddress: { uprn: '1001', displayAddress: '123 Test Street' }
})
