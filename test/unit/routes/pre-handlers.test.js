// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { schemas } from '@defra/fcp-sfd-frontend-engine'

// Things under test
import { validateSbi, validateCrn } from '../../../src/routes/pre-handlers.js'

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
  }
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
        schemas.business.sbi.validate.mockReturnValue({ error: null })
      })

      test('it should allow the request to continue', async () => {
        const result = await validateSbi.method(request, h)

        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })

      test('it should accept a valid numeric SBI', async () => {
        request.params.sbi = '987654321'
        const result = await validateSbi.method(request, h)

        expect(result).toBe(h.continue)
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
        schemas.customer.crn.validate.mockReturnValue({ error: null })
      })

      test('it should allow the request to continue', async () => {
        const result = await validateCrn.method(request, h)

        expect(result).toBe(h.continue)
        expect(h.redirect).not.toHaveBeenCalled()
      })

      test('it should accept a valid numeric CRN', async () => {
        request.params.crn = '9876543210'
        const result = await validateCrn.method(request, h)

        expect(result).toBe(h.continue)
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
    })
  })
})
