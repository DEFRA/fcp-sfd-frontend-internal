// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockFetchBusinessChangeService = vi.fn()

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: mockFetchBusinessChangeService
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  utils: {
    formatValidationErrors: (errors) => ({
      postcode: errors[0]
    })
  }
}))

// Thing under test
const { businessAddressChangeErrorService } = await import('../../../../src/services/business/business-address-change-error-service.js')

describe('businessAddressChangeErrorService', () => {
  let yar
  let sbi
  let email

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '106705779'
    email = 'test.user@defra.gov.uk'

    yar = {
      get: vi.fn().mockReturnValue({ sbi: '106705779' })
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      changeBusinessPostcode: { postcode: 'SW1A 1AA' },
      address: { postcode: 'SW1A 1AA' }
    })
  })

  describe('when preparing error page data', () => {
    test('it fetches business details with changeBusinessPostcode', async () => {
      const errors = [{ message: 'Postcode not found' }]

      await businessAddressChangeErrorService(yar, sbi, email, 'SW1A 1AA', errors)

      expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, sbi, email, 'changeBusinessPostcode')
    })

    test('it returns page data with postcode and errors', async () => {
      const errors = [{ message: 'Postcode not found' }]

      const result = await businessAddressChangeErrorService(yar, sbi, email, 'SW1A 1AA', errors)

      expect(result).toMatchObject({
        pageTitle: 'What is your business address?',
        metaDescription: 'Update the address for your business.',
        postcode: 'SW1A 1AA',
        errors: expect.any(Object)
      })
    })
  })

  describe('when there are no validation errors', () => {
    test('it returns page data with empty errors', async () => {
      const result = await businessAddressChangeErrorService(yar, sbi, email, 'SW1A 1AA', [])

      expect(result).toMatchObject({
        pageTitle: 'What is your business address?',
        metaDescription: 'Update the address for your business.'
      })
    })
  })
})
