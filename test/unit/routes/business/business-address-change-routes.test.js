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
      params: { sbi: '106705779' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: { set: vi.fn(), get: vi.fn().mockReturnValue({ sbi: '106705779' }) },
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

  describe('GET /business/{sbi}/business-address-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessAddressChange.method).toBe('GET')
        expect(getBusinessAddressChange.path).toBe('/business/{sbi}/business-address-change')
      })

      test('it calls fetchBusinessChangeService with credentials and changeBusinessPostcode', async () => {
        await getBusinessAddressChange.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessPostcode')
      })

      test('should render business-address-change view with page data', async () => {
        await getBusinessAddressChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-change', expect.objectContaining({
          pageTitle: 'What is your business address?',
          metaDescription: 'Update the address for your business.',
          postcode: 'SW1A 1AA'
        }))
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessAddressChange.options.pre).toBeDefined()
        expect(getBusinessAddressChange.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-address-change', () => {
    beforeEach(() => {
      request.payload = { postcode: 'SW1A 1AA' }
      fetchBusinessChangeService.mockResolvedValue(getMockData())
      addressLookupService.mockResolvedValue([{ uprn: '1001', displayAddress: '123 Test Street' }])
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
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-address-select')
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
          '106705779',
          request.auth.credentials.email,
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
          '106705779',
          request.auth.credentials.email,
          'SW1A 1AA',
          validationError.details
        )
        expect(h.view).toHaveBeenCalledWith('business/business-address-change', getErrorPageData())
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
  changeBusinessPostcode: { postcode: 'SW1A 1AA' },
  address: { postcode: 'SW1A 1AA' }
})

const getErrorPageData = () => ({
  pageTitle: 'What is your business address?',
  metaDescription: 'Update the address for your business.',
  postcode: 'SW1A 1AA',
  errors: []
})
