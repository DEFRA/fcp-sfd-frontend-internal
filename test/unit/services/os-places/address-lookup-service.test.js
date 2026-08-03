// Test framework dependencies
import { vi, describe, test, expect, beforeEach } from 'vitest'

const mockConfigGet = vi.fn()
const mockAddressLookupService = vi.fn()
const mockSetSessionData = vi.fn()
const mockLoggerError = vi.fn()

// Mocks
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

vi.mock('../../../../src/utils/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    error: mockLoggerError
  })
}))

vi.mock('../../../../src/utils/session/set-session-data.js', () => ({
  setSessionData: mockSetSessionData
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  services: {
    addressLookup: mockAddressLookupService
  }
}))

// Thing under test
const { addressLookupService } = await import('../../../../src/services/os-places/address-lookup-service.js')

describe('addressLookupService (frontend wrapper)', () => {
  const postcode = 'SW1A 1AA'
  const yar = {}
  const osPlacesConfig = {
    clientId: 'fake-client-id',
    osPlacesStub: false
  }
  const mockAddresses = [
    {
      displayAddress: '10 Downing Street, LONDON, SW1A 1AA',
      uprn: '1001'
    },
    {
      displayAddress: '2 The Mall, LONDON, SW1A 2AA',
      uprn: '1002'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockReturnValue(osPlacesConfig)
    mockAddressLookupService.mockResolvedValue(mockAddresses)
  })

  describe('when called with a valid postcode and context', () => {
    test('retrieves osPlacesConfig from application config', async () => {
      await addressLookupService(postcode, yar, 'business')

      expect(mockConfigGet).toHaveBeenCalledWith('osPlacesConfig')
    })

    test('calls the engine service with postcode and config', async () => {
      await addressLookupService(postcode, yar, 'business')

      expect(mockAddressLookupService).toHaveBeenCalledWith(
        postcode,
        osPlacesConfig
      )
    })

    test('stores addresses in session for business context', async () => {
      await addressLookupService(postcode, yar, 'business')

      expect(mockSetSessionData).toHaveBeenCalledWith(
        yar,
        'businessDetailsUpdate',
        'changeBusinessAddresses',
        mockAddresses
      )
    })

    test('stores addresses in session for personal context', async () => {
      await addressLookupService(postcode, yar, 'personal')

      expect(mockSetSessionData).toHaveBeenCalledWith(
        yar,
        'personalDetailsUpdate',
        'changePersonalAddresses',
        mockAddresses
      )
    })

    test('returns the result from the engine service', async () => {
      const result = await addressLookupService(postcode, yar, 'business')

      expect(result).toEqual(mockAddresses)
    })
  })

  describe('when the engine service returns an error with error property', () => {
    test('logs the error and returns it without storing in session', async () => {
      const errorResponse = {
        error: [
          {
            message: 'No addresses found for this postcode',
            path: ['postcode']
          }
        ]
      }
      mockAddressLookupService.mockResolvedValue(errorResponse)

      const result = await addressLookupService(postcode, yar, 'business')

      expect(mockLoggerError).toHaveBeenCalledWith('No addresses found for this postcode', 'Error connecting to OS Places API')
      expect(result).toEqual(errorResponse)
      expect(mockSetSessionData).not.toHaveBeenCalled()
    })
  })

  describe('when address lookup returns no results', () => {
    test('stores empty array in session and returns it', async () => {
      mockAddressLookupService.mockResolvedValue([])

      const result = await addressLookupService(postcode, yar, 'personal')

      expect(mockSetSessionData).toHaveBeenCalledWith(
        yar,
        'personalDetailsUpdate',
        'changePersonalAddresses',
        []
      )
      expect(result).toEqual([])
    })
  })
})
