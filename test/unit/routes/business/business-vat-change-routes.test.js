// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { businessVatChangeRoutes } from '../../../../src/routes/business/business-vat-change-routes.js'
const [getBusinessVatChange, postBusinessVatChange] = businessVatChangeRoutes

// Mocks
vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: vi.fn()
}))

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('business VAT change', () => {
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
  let err

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /business-vat-change', () => {
    describe('when a request is valid', () => {
      beforeEach(() => {
        h = {
          view: vi.fn().mockReturnValue({})
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('should have the correct method and path', () => {
        expect(getBusinessVatChange.method).toBe('GET')
        expect(getBusinessVatChange.path).toBe('/business-vat-change')
      })

      test('it fetches the data from the session', async () => {
        await getBusinessVatChange.handler(request, h)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(request.yar, request.auth.credentials)
      })

      test('should render business-vat-change view with page data', async () => {
        await getBusinessVatChange.handler(request, h)

        expect(h.view).toHaveBeenCalledWith('business/business-vat-change', getPageData())
      })
    })
  })

  describe('POST /business-vat-change', () => {
    beforeEach(() => {
      const responseStub = {
        code: vi.fn().mockReturnThis(),
        takeover: vi.fn().mockReturnThis()
      }

      h = {
        redirect: vi.fn(() => h),
        view: vi.fn(() => responseStub)
      }

      // Mock yar.set for session
      request.yar = {
        set: vi.fn(),
        get: vi.fn().mockReturnValue(getMockData())
      }

      request.payload = { vatNumber: 'GB123456789' }
    })

    describe('when a request succeeds', () => {
      describe('and the validation passes', () => {
        test('it redirects to the /business-vat-check page', async () => {
          await postBusinessVatChange.options.handler(request, h)

          expect(h.redirect).toHaveBeenCalledWith('/business-vat-check')
        })

        test('sets the payload on the yar state', async () => {
          await postBusinessVatChange.options.handler(request, h)

          expect(setSessionData).toHaveBeenCalledWith(
            request.yar,
            'businessDetails',
            'changeBusinessVat',
            request.payload.vatNumber
          )
        })
      })
    })

    describe('when validation fails', () => {
      beforeEach(() => {
        err = {
          details: [
            {
              message: 'Enter a VAT registration number',
              path: ['vatNumber'],
              type: 'any.required'
            }
          ]
        }

        fetchBusinessDetailsService.mockReturnValue(getMockData())
      })

      test('it renders the view with errors', async () => {
        await postBusinessVatChange.options.validate.failAction(request, h, err)

        expect(h.view).toHaveBeenCalledWith('business/business-vat-change', getPageDataError())
      })

      test('it returns a bad request status code', async () => {
        const result = await postBusinessVatChange.options.validate.failAction(request, h, err)

        expect(result.code).toHaveBeenCalledWith(400)
        expect(result.takeover).toHaveBeenCalled()
      })

      test('it should handle undefined errors', async () => {
        // Calling the fail action handler
        await postBusinessVatChange.options.validate.failAction(request, h, [])

        const pageData = getPageDataError()
        pageData.errors = {}

        expect(h.view).toHaveBeenCalledWith('business/business-vat-change', pageData)
      })
    })
  })
})

const getMockData = () => {
  return {
    info: {
      businessName: 'Agile Farm Ltd',
      sbi: '123456789',
      vat: 'GB123456789'
    },
    customer: {
      fullName: 'Alfred Waldron'
    }
  }
}

const getPageData = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    vatNumber: 'GB123456789'
  }
}

const getPageDataError = () => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    businessName: 'Agile Farm Ltd',
    sbi: '123456789',
    userName: 'Alfred Waldron',
    vatNumber: 'GB123456789',
    errors: {
      vatNumber: {
        text: 'Enter a VAT registration number'
      }
    }
  }
}
