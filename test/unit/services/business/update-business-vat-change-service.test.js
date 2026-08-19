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

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  mutations: { updateBusinessVat: 'update-business-vat-mutation' },
  utils: {
    buildUpdateBusinessVatVariables: (vat, sbi) => ({ input: { vat, sbi } })
  },
  constants: {
    successMessages: { BUSINESS_VAT: 'You have updated your VAT registration number' }
  }
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessVatChangeService } = await import('../../../../src/services/business/update-business-vat-change-service.js')

describe('updateBusinessVatChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessVat: 'GB987654321',
      info: { sbi: '107183280' }
    })
  })

  test('fetches the pending VAT change from session', async () => {
    await updateBusinessVatChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessVat')
  })

  test('persists the updated VAT number via the DAL', async () => {
    await updateBusinessVatChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenCalledWith(
      'update-business-vat-mutation',
      { input: { vat: 'GB987654321', sbi: '107183280' } },
      credentials.email
    )
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessVatChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessVatChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your VAT registration number')
  })

  describe('when there is no pending VAT change', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '107183280' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessVatChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL rejects the mutation', () => {
    beforeEach(() => {
      mockUpdateDalService.mockRejectedValue(new Error('DAL error from mutation'))
    })

    test('propagates the error and leaves the session intact', async () => {
      await expect(updateBusinessVatChangeService(yar, credentials)).rejects.toThrow('DAL error from mutation')

      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
