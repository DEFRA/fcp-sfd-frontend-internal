// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { updatePersonalAddressChangeService } from '../../../../src/services/personal/update-personal-address-change-service.js'

// Thing under test
import { personalAddressCheckRoutes } from '../../../../src/routes/customer/personal-address-check-routes.js'
const [getPersonalAddressCheck, postPersonalAddressCheck] = personalAddressCheckRoutes

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/services/personal/update-personal-address-change-service.js', () => ({
  updatePersonalAddressChangeService: vi.fn()
}))

describe('personal address check', () => {
  let request
  let h

  beforeEach(() => {
    vi.clearAllMocks()

    request = {
      params: { crn: '1234567890' },
      auth: { credentials: { email: 'test@example.com' } },
      yar: {}
    }

    h = {
      redirect: vi.fn(),
      view: vi.fn(() => ({
        code: vi.fn().mockReturnThis(),
        takeover: vi.fn().mockReturnThis()
      }))
    }
  })

  describe('GET /customer/{crn}/account-address-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        fetchPersonalChangeService.mockResolvedValue(getMockData())
      })

      test('should have the correct method and path configured', () => {
        expect(getPersonalAddressCheck.method).toBe('GET')
        expect(getPersonalAddressCheck.path).toBe('/customer/{crn}/account-address-check')
      })

      test('it calls fetchPersonalChangeService with changePersonalAddress', async () => {
        await getPersonalAddressCheck.handler(request, h)

        expect(fetchPersonalChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com',
          'changePersonalAddress'
        )
      })

      test('should render personal-address-check view with page data', async () => {
        await getPersonalAddressCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('personal/personal-address-check', expect.any(Object))
      })
    })

    describe('when the crn fails validation', () => {
      test('the route has a pre-handler to validate crn', () => {
        expect(getPersonalAddressCheck.options.pre).toBeDefined()
        expect(getPersonalAddressCheck.options.pre).toHaveLength(1)
      })
    })
  })

  describe('POST /customer/{crn}/account-address-check', () => {
    beforeEach(() => {
      updatePersonalAddressChangeService.mockResolvedValue(undefined)
    })

    test('should have the correct method and path configured', () => {
      expect(postPersonalAddressCheck.method).toBe('POST')
      expect(postPersonalAddressCheck.path).toBe('/customer/{crn}/account-address-check')
    })

    describe('when a request is valid', () => {
      test('it calls updatePersonalAddressChangeService and redirects to customer-details', async () => {
        await postPersonalAddressCheck.handler(request, h)

        expect(updatePersonalAddressChangeService).toHaveBeenCalledWith(
          request.yar,
          '1234567890',
          'test@example.com'
        )
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/details')
      })
    })

    describe('when the crn fails validation', () => {
      test('the route has a pre-handler to validate crn', () => {
        expect(postPersonalAddressCheck.options.pre).toBeDefined()
        expect(postPersonalAddressCheck.options.pre).toHaveLength(1)
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
    address1: '123 Test Street',
    town: 'London',
    postcode: 'SW1A 1AA'
  }
})
