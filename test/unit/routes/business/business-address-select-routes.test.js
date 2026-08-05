// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'

// Thing under test
import { businessAddressSelectRoutes } from '../../../../src/routes/business/business-address-select-routes.js'
const [getBusinessAddressSelect, postBusinessAddressSelect] = businessAddressSelectRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

describe('business address select', () => {
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
      redirect: vi.fn().mockReturnValue({ takeover: vi.fn().mockReturnThis() }),
      view: vi.fn(() => responseStub)
    }
  })

  describe('GET /business/{sbi}/business-address-select', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessAddressSelect.method).toBe('GET')
        expect(getBusinessAddressSelect.path).toBe('/business/{sbi}/business-address-select')
      })

      test('it fetches business change service with multiple fields', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          request.auth.credentials,
          ['changeBusinessPostcode', 'changeBusinessAddresses', 'changeBusinessAddress']
        )
      })

      test('should render business-address-select view with page data', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-select', expect.objectContaining({
          pageTitle: 'Choose your business address',
          metaDescription: 'Choose the address for your business.'
        }))
      })
    })

    describe('when postcode or addresses are missing', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue({
          info: { sbi: '106705779' }
        })
      })

      test('it redirects back to address-change', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-address-change')
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessAddressSelect.options.pre).toBeDefined()
        expect(getBusinessAddressSelect.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-address-select', () => {
    const selectedAddress = { uprn: '1001', displayAddress: '123 Test Street' }

    beforeEach(() => {
      request.payload = { addresses: '1001123 Test Street' }
      fetchBusinessChangeService.mockResolvedValue({
        ...getMockData(),
        changeBusinessAddresses: [selectedAddress]
      })
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressSelect.method).toBe('POST')
      expect(postBusinessAddressSelect.path).toBe('/business/{sbi}/business-address-select')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postBusinessAddressSelect.handler(request, h)

        expect(setSessionData).toHaveBeenCalled()
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-address-check')
      })

      test('it adds postcodeLookup flag to the selected address', async () => {
        await postBusinessAddressSelect.handler(request, h)

        const setSessionDataCall = setSessionData.mock.calls[0]
        expect(setSessionDataCall[3].postcodeLookup).toBe(true)
      })
    })

    describe('when selected address is not found', () => {
      beforeEach(() => {
        request.payload = { addresses: 'notfound' }
      })

      test('it redirects back to address-select', async () => {
        await postBusinessAddressSelect.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-address-select')
      })
    })

    describe('and the validation fails', () => {
      test('it renders the view with validation errors', async () => {
        const validationError = {
          details: [
            {
              message: 'Address selection is required',
              path: ['addresses'],
              type: 'any.required'
            }
          ]
        }

        await postBusinessAddressSelect.options.validate.failAction(request, h, validationError)

        expect(h.view).toHaveBeenCalledWith('business/business-address-select', expect.any(Object))
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
  changeBusinessPostcode: { postcode: 'SW1A 1AA' },
  changeBusinessAddresses: [
    { uprn: '1001', displayAddress: '123 Test Street' }
  ]
})
