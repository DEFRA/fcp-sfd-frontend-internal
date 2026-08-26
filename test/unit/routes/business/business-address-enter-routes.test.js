// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'

// Thing under test
import { businessAddressEnterRoutes } from '../../../../src/routes/business/business-address-enter-routes.js'
const [getBusinessAddressEnter, postBusinessAddressEnter] = businessAddressEnterRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

describe('business address enter', () => {
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

  describe('GET /business/{sbi}/business-address-enter', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessAddressEnter.method).toBe('GET')
        expect(getBusinessAddressEnter.path).toBe('/business/{sbi}/business-address-enter')
      })

      test('it calls fetchBusinessChangeService with credentials and changeBusinessAddress', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessAddress')
      })

      test('should render business-address-enter view with page data', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-enter', expect.objectContaining({
          pageTitle: 'Enter your business address',
          metaDescription: 'Enter the address for your business.'
        }))
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessAddressEnter.options.pre).toBeDefined()
        expect(getBusinessAddressEnter.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-address-enter', () => {
    beforeEach(() => {
      request.payload = {
        address1: '123 Test Street',
        address2: '',
        address3: '',
        city: 'London',
        county: '',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      }
      fetchBusinessChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressEnter.method).toBe('POST')
      expect(postBusinessAddressEnter.path).toBe('/business/{sbi}/business-address-enter')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postBusinessAddressEnter.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessAddress',
          request.payload
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-address-check')
      })
    })

    describe('and the validation fails', () => {
      test('it renders the view with validation errors', async () => {
        const validationError = {
          details: [
            {
              message: 'Address line 1 is required',
              path: ['address1'],
              type: 'any.required'
            }
          ]
        }

        await postBusinessAddressEnter.options.validate.failAction(request, h, validationError)

        expect(h.view).toHaveBeenCalledWith('business/business-address-enter', expect.any(Object))
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
  address: {
    line1: '123 Test Street',
    city: 'London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom'
  }
})
