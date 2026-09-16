// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Thing under test
import { fetchBusinessFixService } from '../../../../src/services/business/fetch-business-fix-service.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details.js'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('fetchBusinessFixService', () => {
  let sbi
  let email
  let sessionData
  const businessDetails = mappedData

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '107183280'
    email = 'test.user@defra.gov.uk'
    sessionData = {
      source: 'name',
      orderedSectionsToFix: ['name', 'email']
    }

    fetchBusinessDetailsService.mockResolvedValue(businessDetails)
  })

  describe('when there are no businessFixUpdates in session', () => {
    test('it returns business details with source and orderedSectionsToFix', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(fetchBusinessDetailsService).toHaveBeenCalledWith(sbi, email)
      expect(result).toEqual({
        source: 'name',
        orderedSectionsToFix: ['name', 'email'],
        ...businessDetails
      })
    })
  })

  describe('when session data is empty', () => {
    test('it returns business details with undefined source and orderedSectionsToFix', async () => {
      const result = await fetchBusinessFixService(sbi, email, {})

      expect(result).toEqual({
        source: undefined,
        orderedSectionsToFix: undefined,
        ...businessDetails
      })
    })
  })

  describe('when name fixes exist in session', () => {
    beforeEach(() => {
      sessionData.businessFixUpdates = {
        name: { businessName: 'Herberts Lawn Mowing' }
      }
    })

    test('it overlays the name fix onto the business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.changeBusinessName).toEqual({ businessName: 'Herberts Lawn Mowing' })
    })

    test('it preserves the other business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.contact).toEqual(businessDetails.contact)
      expect(result.address).toEqual(businessDetails.address)
    })
  })

  describe('when address fixes exist in session', () => {
    beforeEach(() => {
      sessionData.businessFixUpdates = {
        address: { address1: '10 Skirbeck Way', city: 'Maidstone', postcode: 'ME20 6RL', country: 'United Kingdom' }
      }
    })

    test('it overlays the address fix onto the business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.changeBusinessAddress).toEqual({
        address1: '10 Skirbeck Way',
        city: 'Maidstone',
        postcode: 'ME20 6RL',
        country: 'United Kingdom'
      })
    })
  })

  describe('when phone fixes exist in session', () => {
    beforeEach(() => {
      sessionData.businessFixUpdates = {
        phone: { businessTelephone: '01234567890', businessMobile: '07700900000' }
      }
    })

    test('it overlays the phone fix onto the business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.changeBusinessPhoneNumbers).toEqual({
        businessTelephone: '01234567890',
        businessMobile: '07700900000'
      })
    })
  })

  describe('when email fixes exist in session', () => {
    beforeEach(() => {
      sessionData.businessFixUpdates = {
        email: { businessEmail: 'new@email.com' }
      }
    })

    test('it overlays the email fix onto the business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.changeBusinessEmail).toEqual({ businessEmail: 'new@email.com' })
    })
  })

  describe('when vat fixes exist in session', () => {
    beforeEach(() => {
      sessionData.businessFixUpdates = {
        vat: { vatNumber: '123456789' }
      }
    })

    test('it overlays the vat fix onto the business details', async () => {
      const result = await fetchBusinessFixService(sbi, email, sessionData)

      expect(result.changeBusinessVat).toEqual({ vatNumber: '123456789' })
    })
  })

  describe('when no session data is provided', () => {
    test('it defaults to an empty session', async () => {
      const result = await fetchBusinessFixService(sbi, email)

      expect(result.changeBusinessName).toBeUndefined()
      expect(result.orderedSectionsToFix).toBeUndefined()
    })
  })
})
