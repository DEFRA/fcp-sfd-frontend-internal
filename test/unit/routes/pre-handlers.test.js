// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { schemas, services } from '@defra/fcp-sfd-frontend-engine'

// Things under test
import { validateSbi, validateCrn, checkCrnAndInterrupterJourney, checkSbiAndInterrupterJourney, validateLegalStatusRegistrationNumber } from '../../../src/routes/pre-handlers.js'

// Mock the service we need for the new pre-handler
import { fetchBusinessChangeService } from '../../../src/services/business/fetch-business-change-service.js'

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  schemas: {
    business: {
      sbi: {
        validate: vi.fn()
      }
    },
    customer: {
      crn: {
        validate: vi.fn()
      }
    }
  },
  services: {
    checkInterrupterJourneySession: vi.fn()
  },
  constants: {
    business: {
      CHARITY_REGISTRATION_LEGAL_STATUS_CODES: ['102101', '102102'],
      COMPANY_REGISTRATION_LEGAL_STATUS_CODES: ['102105', '102106']
    }
  }
}))

vi.mock('../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

describe('pre-handlers', () => {
  let h
  let takeoverMock

  beforeEach(() => {
    vi.clearAllMocks()

    takeoverMock = vi.fn()
    h = {
      redirect: vi.fn().mockReturnValue({ takeover: takeoverMock }),
      continue: {}
    }
  })

  describe('validateSbi', () => {
    let request

    beforeEach(() => {
      request = {
        params: { sbi: '123456789' }
      }
    })

    describe('when SBI is valid', () => {
      beforeEach(() => {
        schemas.business.sbi.validate.mockReturnValue({ error: null, value: { sbi: request.params.sbi } })
      })

      test('it should allow the request to continue', async () => {
        const result = await validateSbi.method(request, h)

        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })

    describe('when SBI is invalid', () => {
      beforeEach(() => {
        schemas.business.sbi.validate.mockReturnValue({ error: { message: 'Invalid SBI' } })
      })

      test('it should redirect to search-sbi', async () => {
        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(takeoverMock).toHaveBeenCalled()
      })

      test('it should redirect for empty SBI', async () => {
        request.params.sbi = ''
        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })

      test('it should redirect for SBI with incorrect length', async () => {
        request.params.sbi = '12345'
        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })

      test('it should redirect when params.sbi is undefined', async () => {
        request.params.sbi = undefined
        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })

      test('it should redirect when params object is missing entirely', async () => {
        request.params = undefined
        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })
  })

  describe('validateCrn', () => {
    let request

    beforeEach(() => {
      request = {
        params: { crn: '1234567890' }
      }
    })

    describe('when CRN is valid', () => {
      beforeEach(() => {
        schemas.customer.crn.validate.mockReturnValue({ error: null, value: { crn: request.params.crn } })
      })

      test('it should allow the request to continue', async () => {
        const result = await validateCrn.method(request, h)

        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })

    describe('when CRN is invalid', () => {
      beforeEach(() => {
        schemas.customer.crn.validate.mockReturnValue({ error: { message: 'Invalid CRN' } })
      })

      test('it should redirect to search-crn', async () => {
        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(takeoverMock).toHaveBeenCalled()
      })

      test('it should redirect for empty CRN', async () => {
        request.params.crn = ''
        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })

      test('it should redirect for CRN with incorrect length', async () => {
        request.params.crn = '12345'
        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })

      test('it should redirect when params.crn is undefined', async () => {
        request.params.crn = undefined
        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })

      test('it should redirect when params object is missing entirely', async () => {
        request.params = undefined
        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })
    })
  })

  describe('checkCrnAndInterrupterJourney', () => {
    let request
    let redirectStub

    const journey = {
      journeyKey: 'personalFixJourney',
      redirectPath: '/customer/{crn}/details'
    }

    beforeEach(() => {
      redirectStub = {
        takeover: vi.fn().mockReturnThis()
      }

      h = {
        redirect: vi.fn(() => redirectStub),
        continue: {}
      }

      request = {
        yar: {},
        params: { crn: '1234567890' }
      }
    })

    describe('when CRN validation fails', () => {
      beforeEach(() => {
        schemas.customer.crn.validate.mockReturnValue({ error: { message: 'Invalid CRN' } })
      })

      test('it redirects to search-crn without checking journey', () => {
        const preHandler = checkCrnAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(redirectStub.takeover).toHaveBeenCalled()
        expect(services.checkInterrupterJourneySession).not.toHaveBeenCalled()
      })

      test('it redirects when params.crn is undefined', () => {
        request.params.crn = undefined
        const preHandler = checkCrnAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(services.checkInterrupterJourneySession).not.toHaveBeenCalled()
      })

      test('it redirects when params object is missing', () => {
        request.params = undefined
        const preHandler = checkCrnAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })
    })

    describe('when CRN is valid but journey session is invalid', () => {
      beforeEach(() => {
        schemas.customer.crn.validate.mockReturnValue({ error: null, value: { crn: '1234567890' } })
        services.checkInterrupterJourneySession.mockReturnValue(false)
      })

      test('it redirects to the journey redirect path with crn substitution', () => {
        const preHandler = checkCrnAndInterrupterJourney(journey)
        const result = preHandler.method(request, h)

        expect(services.checkInterrupterJourneySession).toHaveBeenCalledWith(request.yar, journey.journeyKey)
        expect(h.redirect).toHaveBeenCalledWith('/customer/1234567890/details')
        expect(redirectStub.takeover).toHaveBeenCalled()
        expect(result).toBe(redirectStub)
      })
    })

    describe('when CRN is valid and journey session is valid', () => {
      beforeEach(() => {
        schemas.customer.crn.validate.mockReturnValue({ error: null, value: { crn: '1234567890' } })
        services.checkInterrupterJourneySession.mockReturnValue(true)
      })

      test('it returns h.continue without redirecting', () => {
        const preHandler = checkCrnAndInterrupterJourney(journey)
        const result = preHandler.method(request, h)

        expect(services.checkInterrupterJourneySession).toHaveBeenCalledWith(request.yar, journey.journeyKey)
        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('checkSbiAndInterrupterJourney', () => {
    let request
    let redirectStub

    const journey = {
      journeyKey: 'businessFixJourney',
      redirectPath: '/business/{sbi}/details'
    }

    beforeEach(() => {
      redirectStub = {
        takeover: vi.fn().mockReturnThis()
      }

      h = {
        redirect: vi.fn(() => redirectStub),
        continue: {}
      }

      request = {
        yar: {},
        params: { sbi: '123456789' }
      }
    })

    describe('when SBI validation fails', () => {
      beforeEach(() => {
        schemas.business.sbi.validate.mockReturnValue({ error: { message: 'Invalid SBI' } })
      })

      test('it redirects to search-sbi without checking journey', () => {
        const preHandler = checkSbiAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(redirectStub.takeover).toHaveBeenCalled()
        expect(services.checkInterrupterJourneySession).not.toHaveBeenCalled()
      })

      test('it redirects when params.sbi is undefined', () => {
        request.params.sbi = undefined
        const preHandler = checkSbiAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(services.checkInterrupterJourneySession).not.toHaveBeenCalled()
      })

      test('it redirects when params object is missing', () => {
        request.params = undefined
        const preHandler = checkSbiAndInterrupterJourney(journey)
        preHandler.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })
    })

    describe('when SBI is valid but journey session is invalid', () => {
      beforeEach(() => {
        schemas.business.sbi.validate.mockReturnValue({ error: null, value: { sbi: '123456789' } })
        services.checkInterrupterJourneySession.mockReturnValue(false)
      })

      test('it redirects to the journey redirect path with sbi substitution', () => {
        const preHandler = checkSbiAndInterrupterJourney(journey)
        const result = preHandler.method(request, h)

        expect(services.checkInterrupterJourneySession).toHaveBeenCalledWith(request.yar, journey.journeyKey)
        expect(h.redirect).toHaveBeenCalledWith('/business/123456789/details')
        expect(redirectStub.takeover).toHaveBeenCalled()
        expect(result).toBe(redirectStub)
      })
    })

    describe('when SBI is valid and journey session is valid', () => {
      beforeEach(() => {
        schemas.business.sbi.validate.mockReturnValue({ error: null, value: { sbi: '123456789' } })
        services.checkInterrupterJourneySession.mockReturnValue(true)
      })

      test('it returns h.continue without redirecting', () => {
        const preHandler = checkSbiAndInterrupterJourney(journey)
        const result = preHandler.method(request, h)

        expect(services.checkInterrupterJourneySession).toHaveBeenCalledWith(request.yar, journey.journeyKey)
        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('validateLegalStatusRegistrationNumber', () => {
    let request
    let takeoverMock

    beforeEach(() => {
      takeoverMock = vi.fn().mockReturnValue({})
      h = {
        redirect: vi.fn().mockReturnValue({ takeover: takeoverMock }),
        continue: {}
      }

      request = {
        params: { sbi: '106705779' },
        yar: { get: vi.fn() },
        auth: { credentials: { email: 'test@example.com' } }
      }

      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi: '106705779', legalStatusCode: '102111' },
        changeBusinessLegalStatus: '102111'
      })
    })

    test('it returns h.continue when legal status does not require a registration number', async () => {
      const result = await validateLegalStatusRegistrationNumber.method(request, h)

      expect(result).toBe(h.continue)
      expect(h.redirect).not.toHaveBeenCalled()
    })

    test('it redirects to enter page when charity status is selected but no charity number is present', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi: '106705779', legalStatusCode: '102111' },
        changeBusinessLegalStatus: '102101',
        changeBusinessCharityCommissionRegistrationNumber: null
      })

      await validateLegalStatusRegistrationNumber.method(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-enter')
      expect(takeoverMock).toHaveBeenCalled()
    })

    test('it redirects to enter page when company status is selected but no company number is present', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi: '106705779', legalStatusCode: '102111' },
        changeBusinessLegalStatus: '102105',
        changeBusinessCompanyRegistrationNumber: null
      })

      await validateLegalStatusRegistrationNumber.method(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/business/106705779/business-legal-status-enter')
      expect(takeoverMock).toHaveBeenCalled()
    })

    test('it returns h.continue when charity status is selected and charity number is present', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi: '106705779', legalStatusCode: '102111' },
        changeBusinessLegalStatus: '102101',
        changeBusinessCharityCommissionRegistrationNumber: '1234567'
      })

      const result = await validateLegalStatusRegistrationNumber.method(request, h)

      expect(result).toBe(h.continue)
      expect(h.redirect).not.toHaveBeenCalled()
    })

    test('it returns h.continue when company status is selected and company number is present', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi: '106705779', legalStatusCode: '102111' },
        changeBusinessLegalStatus: '102105',
        changeBusinessCompanyRegistrationNumber: '12345678'
      })

      const result = await validateLegalStatusRegistrationNumber.method(request, h)

      expect(result).toBe(h.continue)
      expect(h.redirect).not.toHaveBeenCalled()
    })
  })
})
