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
      params: { sbi: '123456789' },
      auth: { credentials: { email: 'user@example.com' } },
      yar: {},
      payload: {},
      info: { referrer: 'http://example.com/business/123456789/business-address-change' }
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

      test('it calls fetchBusinessChangeService with changeBusinessAddress', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'changeBusinessAddress'
        )
      })

      test('should render business-address-enter view with page data', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-address-enter', expect.any(Object))
      })
    })

    describe('when the sbi fails validation', () => {
      beforeEach(() => {
        request.params.sbi = 'invalid-sbi'
      })

      test('it redirects to the search-sbi page and does not fetch data', async () => {
        await getBusinessAddressEnter.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(fetchBusinessChangeService).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /business/{sbi}/business-address-enter', () => {
    beforeEach(() => {
      request.payload = {
        address1: '123 Business Street',
        town: 'London',
        postcode: 'SW1A 1AA'
      }
      fetchBusinessChangeService.mockResolvedValue(getMockData())
    })

    test('should have the correct method and path configured', () => {
      expect(postBusinessAddressEnter.method).toBe('POST')
      expect(postBusinessAddressEnter.path).toBe('/business/{sbi}/business-address-enter')
    })

    describe('and the validation passes', () => {
      test('it sets session data and redirects to address check', async () => {
        await postBusinessAddressEnter.options.handler(request, h)

        expect(setSessionData).toHaveBeenCalledWith(
          request.yar,
          'businessDetailsUpdate',
          'changeBusinessAddress',
          request.payload
        )
        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/business-address-check')
      })
    })

    describe('and the validation fails', () => {
      test('it fetches business details and returns error response', async () => {
        const validationError = {
          details: [
            {
              message: 'Address is required',
              path: ['address1'],
              type: 'any.required'
            }
          ]
        }

        await postBusinessAddressEnter.options.validate.failAction(request, h, validationError)

        expect(fetchBusinessChangeService).toHaveBeenCalledWith(
          request.yar,
          '123456789',
          'user@example.com',
          'changeBusinessAddress'
        )
        expect(h.view).toHaveBeenCalledWith('business/business-address-enter', expect.any(Object))
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
    address1: '456 Another Business Street',
    town: 'Manchester',
    postcode: 'M1 1AA'
  }
})
