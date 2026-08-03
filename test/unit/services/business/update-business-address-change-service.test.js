// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock dependencies
const mockFetchBusinessChangeService = vi.fn()
const mockUpdateDalService = vi.fn()
const mockFlashNotification = vi.fn()

vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: mockFetchBusinessChangeService
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: mockUpdateDalService
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessAddressChangeService } = await import('../../../../src/services/business/update-business-address-change-service.js')

describe('updateBusinessAddressChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessAddress: {
        address1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      info: { sbi: '107183280' }
    })
  })

  test('fetches the pending business address change from session', async () => {
    await updateBusinessAddressChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessAddress')
  })

  test('persists the updated address via the DAL', async () => {
    await updateBusinessAddressChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      credentials.email
    )
  })

  test('builds the correct mutation variables for manual address entry', async () => {
    await updateBusinessAddressChangeService(yar, credentials)

    const variables = mockUpdateDalService.mock.calls[0][1]
    expect(variables.input.sbi).toBe('107183280')
    expect(variables.input.address.withoutUprn).toBeDefined()
    expect(variables.input.address.withUprn).toBeUndefined()
  })

  test('builds the correct mutation variables for postcode lookup address', async () => {
    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessAddress: {
        uprn: '1001',
        address1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      info: { sbi: '107183280' }
    })

    await updateBusinessAddressChangeService(yar, credentials)

    const variables = mockUpdateDalService.mock.calls[0][1]
    expect(variables.input.address.withUprn).toBeDefined()
    expect(variables.input.address.withoutUprn).toBeUndefined()
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessAddressChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessAddressChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business address')
  })

  describe('when there is no pending business address change', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '107183280' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessAddressChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
