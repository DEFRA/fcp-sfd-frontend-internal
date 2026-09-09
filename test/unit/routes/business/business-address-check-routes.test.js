// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { updateBusinessAddressChangeService } from '../../../../src/services/business/update-business-address-change-service.js'

// Thing under test
import { businessAddressCheckRoutes } from '../../../../src/routes/business/business-address-check-routes.js'
const [getBusinessAddressCheck, postBusinessAddressCheck] = businessAddressCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-address-change-service.js', () => ({
  updateBusinessAddressChangeService: vi.fn()
}))

describe('business address check', () => {
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

  describe('GET /business/{sbi}/business-address-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchBusinessChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getBusinessAddressCheck.method).toBe('GET')
        expect(getBusinessAddressCheck.path).toBe('/business/{sbi}/business-address-check')
      })

      test('it calls fetchBusinessChangeService with credentials and changeBusinessAddress', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email, 'changeBusinessAddress')
      })

      test('should render business-address-check view with page data', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-check', expect.objectContaining({
          pageTitle: 'Check your business address is correct before submitting',
          metaDescription: 'Check the address for your business is correct.'
        }))
      })
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(getBusinessAddressCheck.options.pre).toBeDefined()
        expect(getBusinessAddressCheck.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /business/{sbi}/business-address-check', () => {
    beforeEach(() => {
      fetchBusinessChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressCheck.method).toBe('POST')
      expect(postBusinessAddressCheck.path).toBe('/business/{sbi}/business-address-check')
    })

    test('it calls updateBusinessAddressChangeService', async () => {
      await postBusinessAddressCheck.handler(request, h)

      expect(updateBusinessAddressChangeService).toHaveBeenCalledWith(request.yar, '106705779', request.auth.credentials.email)
    })

    test('it redirects to business details', async () => {
      await postBusinessAddressCheck.handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/details')
    })

    describe('when the sbi fails validation', () => {
      test('the route has a pre-handler to validate sbi', () => {
        expect(postBusinessAddressCheck.options.pre).toBeDefined()
        expect(postBusinessAddressCheck.options.pre).toHaveLength(1)
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
  changeBusinessAddress: {
    address1: '123 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
    postcodeLookup: false
  },
  address: {
    line1: '123 Test Street',
    city: 'London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom'
  }
})
