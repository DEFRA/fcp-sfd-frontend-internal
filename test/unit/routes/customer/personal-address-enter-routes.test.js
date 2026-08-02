// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Thing under test
import { personalAddressEnterRoutes } from '../../../../src/routes/customer/personal-address-enter-routes.js'
const [getPersonalAddressEnter, postPersonalAddressEnter] = personalAddressEnterRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

describe('personal address enter', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn: '1234567890' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: {},
      payload: {},
      info: { referrer: 'http://example.com/previous-page' }
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

  describe('GET /customer/{crn}/account-address-enter', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalAddressEnter.method).toBe('GET')
        expect(getPersonalAddressEnter.path).toBe('/customer/{crn}/account-address-enter')
      })

      test('it calls fetchPersonalChangeService with changePersonalAddress', async () => {
        await getPersonalAddressEnter.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalAddress'
        )
      })

      test('should render personal-address-enter view with page data', async () => {
        await getPersonalAddressEnter.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-address-enter', expect.any(Object))
      })
    })

    describe('when the crn fails validation', () => {
      test('the route has a pre-handler to validate crn', () => {
        expect(getPersonalAddressEnter.options.pre).toBeDefined()
        expect(getPersonalAddressEnter.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /customer/{crn}/account-address-enter', () => {
    beforeEach(() => {
      request.payload = {
        address1: '123 Test Street',
        town: 'London',
        postcode: 'SW1A 1AA'
      }
      fetchPersonalChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalAddressEnter.method).toBe('POST')
      expect(postPersonalAddressEnter.path).toBe('/customer/{crn}/account-address-enter')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postPersonalAddressEnter.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'personalDetailsUpdate',
          'changePersonalAddress',
          request.payload
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/account-address-check')
      })
    })

    describe('and the validation fails', () => {
      test('it fetches personal details and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Address is required',
              path: ['address1'],
              type: 'any.required'
            }
          ]
        }

        await postPersonalAddressEnter.options.validate.failAction(request, h, validationError)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalAddress'
        )
        expect(h.view).toHaveBeenCalledWith('personal/personal-address-enter', expect.any(Object))
      })

      test('it returns a BAD_REQUEST status code', async () => {
        const validationError = { details: [] }

        await postPersonalAddressEnter.options.validate.failAction(request, h, validationError)

        expect(h.view).toHaveBeenCalled()
      })

      test('it includes the payload in response for form re-population', async () => {
        const validationError = { details: [] }

        await postPersonalAddressEnter.options.validate.failAction(request, h, validationError)

        const callArgs = h.view.mock.calls[0]
        expect(callArgs[0]).toBe('personal/personal-address-enter')
      })
    })
  })
})

const getMockData = () => ({
  info: { userName: 'John Doe' },
  changePersonalAddress: {
    address1: '123 Test Street',
    town: 'London',
    postcode: 'SW1A 1AA'
  },
  address: {
    address1: '456 Another Street',
    town: 'Manchester',
    postcode: 'M1 1AA'
  }
})
