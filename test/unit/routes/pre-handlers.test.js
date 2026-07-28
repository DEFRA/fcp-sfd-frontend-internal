// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things under test
import { validateSbi, validateCrn } from '../../../src/routes/pre-handlers.js'

describe('pre-handlers', () => {
  let h

  beforeEach(() => {
    h = {
      redirect: vi.fn(),
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
      test('it should redirect to search-sbi', async () => {
        request.params.sbi = 'invalid-sbi'
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
        expect(takeoverStub).toHaveBeenCalled()
      })

      test('it should redirect for empty SBI', async () => {
        request.params.sbi = ''
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

        await validateSbi.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-sbi')
      })

      test('it should redirect for SBI with incorrect length', async () => {
        request.params.sbi = '12345'
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

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
      test('it should redirect to search-crn', async () => {
        request.params.crn = 'invalid-crn'
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
        expect(takeoverStub).toHaveBeenCalled()
      })

      test('it should redirect for empty CRN', async () => {
        request.params.crn = ''
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })

      test('it should redirect for CRN with incorrect length', async () => {
        request.params.crn = '12345'
        const takeoverStub = vi.fn()
        h.redirect.mockReturnValue({ takeover: takeoverStub })

        await validateCrn.method(request, h)

        expect(h.redirect).toHaveBeenCalledWith('/search-crn')
      })
    })
  })
})
