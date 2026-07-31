// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { addressLookupService } from '../../../../src/services/os-places/address-lookup-service.js'
import { businessAddressChangeErrorService } from '../../../../src/services/business/business-address-change-error-service.js'

// Thing under test
import { businessAddressChangeRoutes } from '../../../../src/routes/business/business-address-change-routes.js'
const [getBusinessAddressChange, postBusinessAddressChange] = businessAddressChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/os-places/address-lookup-service.js', () => ({
  addressLookupService: vi.fn()
}))

vi.mock('../../../../src/services/business/business-address-change-error-service.js', () => ({
  businessAddressChangeErrorService: vi.fn()
}))

describe('business address change', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { sbi: '123456789' },
      auth: { credentials: { email: 'user@example.com' } },
      yar: {},
      payload: {},
      info: { referrer: 'http://example.com/business/123456789' }
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

  describe('GET /business/{sbi}/business-address-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessAddressChange.method).toBe('GET')
        expect(getBusinessAddressChange.path).toBe('/business/{sbi}/business-address-change')
      })

      test('it calls fetchBusinessChangeService with sbi, email, and changeBusinessPostcode', async () => {
        await getBusinessAddressChange.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '123456789', 'user@example.com', 'changeBusinessPostcode')
      })

      test('should render business-address-change view with page data', async () => {
        await getBusinessAddressChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-change', expect.any(Object))
      })
    })

    describe('when the sbi fails validation', () => {
      beforeEach(() => {
        request.params.sbi = 'invalid-sbi'
      })

      test('it redirects to the search-sbi page and does not fetch data', async () => {
        await getBusinessAddressChange.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(fetchBusinessChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /business/{sbi}/business-address-change', () => {
    beforeEach(() => {
      request.payload = { postcode: 'SW1A 1AA' }
      fetchBusinessChangeService.mockResolvedValue(getMockData())
      addressLookupService.mockResolvedValue([{ uprn: '1001', displayAddress: '123 Business Street' }])
      businessAddressChangeErrorService.mockResolvedValue(getErrorPageData())
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressChange.method).toBe('POST')
      expect(postBusinessAddressChange.path).toBe('/business/{sbi}/business-address-change')
    })

    describe('and the validation passes', () => {
      test('it sets session data, calls addressLookupService, and redirects to address select', async () => {
        await postBusinessAddressChange.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessPostcode',
          request.payload
        )
        expect(addressLookupService).toHaveBeenCalledWith('SW1A 1AA', request.yar, 'business')
        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business-address-select')
      })
    })

    describe('and address lookup returns an error', () => {
      beforeEach(() => {
        addressLookupService.mockResolvedValue({ error: [{ message: 'Postcode not found' }] })
      })

      test('it calls businessAddressChangeErrorService and renders the view with error code', async () => {
        await postBusinessAddressChange.handler(request, h)

        expect(businessAddressChangeErrorService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'SW1A 1AA',
          [{ message: 'Postcode not found' }]
        )
        expect(h.view).toHaveBeenCalledWith('business/business-address-change', getErrorPageData())
      })
    })

    describe('and the validation fails', () => {
      test('it calls businessAddressChangeErrorService and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Postcode is required',
              path: ['postcode'],
              type: 'any.required'
            }
          ]
        }

        await postBusinessAddressChange.options.validate.failAction(request, h, validationError)

        expect(businessAddressChangeErrorService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'SW1A 1AA',
          validationError.details
        )
        expect(h.view).toHaveBeenCalledWith('business/business-address-change', getErrorPageData())
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '123456789', businessName: 'Test Business Ltd' },
  customer: { userName: 'User Name' },
  changeBusinessPostcode: { postcode: 'SW1A 1AA' }
})

const getErrorPageData = () => ({
  errors: {}
})
