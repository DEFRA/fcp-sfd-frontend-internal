// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchBusinessPhoneNumbersChangeService } from '../../../../src/services/business/fetch-business-phone-numbers-change-service.js'
import { updateBusinessPhoneNumbersChangeService } from '../../../../src/services/business/update-business-phone-numbers-change-service.js'

// Thing under test
import { businessPhoneNumbersCheckRoutes } from '../../../../src/routes/business/business-phone-numbers-check-routes.js'
const [getBusinessPhoneNumbersCheck, postBusinessPhoneNumbersCheck] = businessPhoneNumbersCheckRoutes

// Mocks
vi.mock('../../../../src/services/business/fetch-business-phone-numbers-change-service.js', () => ({
  fetchBusinessPhoneNumbersChangeService: vi.fn()
}))

vi.mock('../../../../src/services/business/update-business-phone-numbers-change-service.js', () => ({
  updateBusinessPhoneNumbersChangeService: vi.fn()
}))

describe('business phone numbers check', () => {
  const request = {
    yar: {},
    auth: {
      credentials: {
        sbi: '123456789',
        crn: '987654321',
        email: 'test@example.com'
      }
    }
  }
  let h

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /business-phone-numbers-check', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessPhoneNumbersChangeService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessPhoneNumbersCheck.method).toBe('GET')
        expect(getBusinessPhoneNumbersCheck.path).toBe('/business-phone-numbers-check')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessPhoneNumbersCheck.handler(request, h)

        expect(fetchBusinessPhoneNumbersChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-phone-numbers-check view with page data', async () => {
        await getBusinessPhoneNumbersCheck.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-phone-numbers-check', getPageData())
      })
    })
  })

  describe('POST /business-phone-numbers-check', () => {
    beforeEach(() => {
      h = {
        redirect: vi.fn(() => h)
      }
    })

    describe('when a request succeeds', () => {
      test('it redirects to the /business-details page', async () => {
        await postBusinessPhoneNumbersCheck.handler(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/business-details')
      })

      test('sets the payload on the yar state', async () => {
        await postBusinessPhoneNumbersCheck.handler(request, h)

        expect(updateBusinessPhoneNumbersChangeService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      sbi: '123456789',
      businessName: 'Agile Farm Ltd'
    },
    customer: {
      fullName: 'Alfred Waldron'
    },
    contact: {
      landline: '02222 222222',
      mobile: '01111 111111'
    },
    changeBusinessTelephone: '01111 111111',
    changeBusinessMobile: null
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-phone-numbers-change' },
    changeLink: '/business-phone-numbers-change',
    pageTitle: 'Check your business phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your business are correct.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    businessMobile: null,
    businessTelephone: '01111 111111'
  }
}
