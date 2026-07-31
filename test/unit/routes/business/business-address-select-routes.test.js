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
      redirect: vi.fn(() => responseStub),
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

      test('it calls fetchBusinessChangeService with required fields', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          ['changeBusinessPostcode', 'changeBusinessAddresses', 'changeBusinessAddress']
        )
      })

      test('should render business-address-select view with page data', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-select', expect.any(Object))
      })
    })

    describe('when the sbi fails validation', () => {
      beforeEach(() => {
        request.params.sbi = 'invalid-sbi'
      })

      test('it redirects to the search-sbi page', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(fetchBusinessChangeService).not.toHaveBeenCalled()
      })
    })

    describe('when required session data is missing', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue({
          changeBusinessPostcode: null,
          changeBusinessAddresses: [{ uprn: '1001', displayAddress: '123 Business Street' }]
        })
      })

      test('it redirects to the address change page', async () => {
        await getBusinessAddressSelect.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business-address-change')
      })
    })
  })

  describe('POST /business/{sbi}/business-address-select', () => {
    beforeEach(() => {
      request.payload = { addresses: '1001123 Business Street' }
      fetchBusinessChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressSelect.method).toBe('POST')
      expect(postBusinessAddressSelect.path).toBe('/business/{sbi}/business-address-select')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postBusinessAddressSelect.options.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'changeBusinessAddresses'
        )
        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessAddress',
          {
            uprn: '1001',
            displayAddress: '123 Business Street',
            postcodeLookup: true
          }
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business-address-check')
      })
    })

    describe('and selected address is not found', () => {
      beforeEach(() => {
        request.payload = { addresses: 'invalid-address' }
      })

      test('it redirects back to address select', async () => {
        await postBusinessAddressSelect.options.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business-address-select')
      })
    })

    describe('and the validation fails', () => {
      test('it fetches business details and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Choose an address',
              path: ['addresses'],
              type: 'any.required'
            }
          ]
        }

        await postBusinessAddressSelect.options.validate.failAction(request, h, validationError)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          ['changeBusinessPostcode', 'changeBusinessAddresses']
        )
        expect(h.view).toHaveBeenCalledWith('business/business-address-select', expect.any(Object))
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '123456789', businessName: 'Test Business Ltd' },
  customer: { userName: 'User Name' },
  changeBusinessPostcode: { postcode: 'SW1A 1AA' },
  changeBusinessAddresses: [
    { uprn: '1001', displayAddress: '123 Business Street' },
    { uprn: '1002', displayAddress: '124 Business Street' }
  ],
  changeBusinessAddress: { uprn: '1001', displayAddress: '123 Business Street' }
})
