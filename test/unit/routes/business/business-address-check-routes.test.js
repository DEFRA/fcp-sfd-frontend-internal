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
      params: { sbi: '123456789' },
      auth: { credentials: { email: 'user@example.com' } },
      yar: {},
      info: { referrer: 'http://example.com/business/123456789' }
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => ({
        code: vi.fn().mockReturnThis(),
        takeover: vi.fn().mockReturnThis()
      }))
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

      test('it calls fetchBusinessChangeService with changeBusinessAddress', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'changeBusinessAddress'
        )
      })

      test('should render business-address-check view with page data', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-check', expect.any(Object))
      })
    })

    describe('when the sbi fails validation', () => {
      beforeEach(() => {
        request.params.sbi = 'invalid-sbi'
      })

      test('it redirects to the search-sbi page and does not fetch data', async () => {
        await getBusinessAddressCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(fetchBusinessChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /business/{sbi}/business-address-check', () => {
    beforeEach(() => {
      updateBusinessAddressChangeService.mockResolvedValue(undefined)
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressCheck.method).toBe('POST')
      expect(postBusinessAddressCheck.path).toBe('/business/{sbi}/business-address-check')
    })

    describe('when a request is valid', () => {
      test('it calls updateBusinessAddressChangeService and redirects to business page', async () => {
        await postBusinessAddressCheck.handler(request, h)

        expect(updateBusinessAddressChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com'
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business')
      })
    })

    describe('when the sbi fails validation', () => {
      beforeEach(() => {
        request.params.sbi = 'invalid-sbi'
      })

      test('it redirects to the search-sbi page and does not update', async () => {
        await postBusinessAddressCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(updateBusinessAddressChangeService).not.toHaveBeenCalled()
      })
    })
  })
})

const getMockData = () => ({
  info: { sbi: '123456789', businessName: 'Test Business Ltd' },
  customer: { userName: 'User Name' },
  changeBusinessAddress: {
    address1: '123 Business Street',
    town: 'London',
    postcode: 'SW1A 1AA'
  },
  address: {
    address1: '123 Business Street',
    town: 'London',
    postcode: 'SW1A 1AA'
  }
})
