// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { utils } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { personalAddressChangeErrorService } from '../../../../src/services/personal/personal-address-change-error-service.js'

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  utils: { formatValidationErrors: vi.fn() }
}))

describe('personalAddressChangeErrorService', () => {
  const yar = {}
  const crn = '1234567890'
  const email = 'test@example.com'
  const postcode = 'SW1A 1AA'
  let errors

  beforeEach(() => {
    vi.clearAllMocks()

    errors = [{ path: ['postcode'], message: 'Invalid postcode' }]

    fetchPersonalChangeService.mockResolvedValue(mockPersonalDetails())
    utils.formatValidationErrors.mockReturnValue([{ text: 'An error occurred' }])
  })

  describe('when called with validation errors', () => {
    test('it formats the errors', async () => {
      await personalAddressChangeErrorService(yar, crn, email, postcode, errors)

      expect(utils.formatValidationErrors).toHaveBeenCalledWith(errors)
    })

    test('it fetches personal details including changePersonalPostcode', async () => {
      await personalAddressChangeErrorService(yar, crn, email, postcode, errors)

      expect(fetchPersonalChangeService).toHaveBeenCalledWith(
        yar,
        crn,
        email,
        'changePersonalPostcode'
      )
    })

    test('it calls the presenter with personal details and postcode', async () => {
      const result = await personalAddressChangeErrorService(yar, crn, email, postcode, errors)

      expect(result).toEqual({
        backLink: '/customer/1234567890/details',
        manualAddressLink: '/customer/1234567890/account-address-enter',
        pageTitle: 'What is your personal address?',
        metaDescription: 'Update the address for your personal account.',
        userName: 'John Doe',
        crn: '1234567890',
        postcode: 'SW1A 1AA',
        errors: [{ text: 'An error occurred' }]
      })
    })
  })

  describe('when called without an error', () => {
    test('it defaults errors to an empty array', async () => {
      await personalAddressChangeErrorService(yar, crn, email, postcode)

      expect(utils.formatValidationErrors).toHaveBeenCalledWith([])
    })
  })
})

const mockPersonalDetails = () => {
  return {
    crn: '1234567890',
    address: {
      postcode: 'SW1A 1AA'
    },
    info: {
      userName: 'John Doe'
    },
    changePersonalPostcode: {
      postcode: 'SW1A 1AA'
    }
  }
}
