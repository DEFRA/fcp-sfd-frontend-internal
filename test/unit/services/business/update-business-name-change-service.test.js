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
  mutations: { updateBusinessName: 'update-business-name-mutation' },
  utils: {
    buildUpdateBusinessNameVariables: (name, sbi) => ({ input: { name, sbi } })
  },
  constants: {
    successMessages: { BUSINESS_NAME: 'You have updated your business name' }
  }
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessNameChangeService } = await import('../../../../src/services/business/update-business-name-change-service.js')

describe('updateBusinessNameChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessName: 'New Farm Ltd',
      info: { sbi: '107183280' }
    })
  })

  test('fetches the pending business name change from session', async () => {
    await updateBusinessNameChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessName')
  })

  test('persists the updated name via the DAL', async () => {
    await updateBusinessNameChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenCalledWith(
      'update-business-name-mutation',
      { input: { name: 'New Farm Ltd', sbi: '107183280' } },
      credentials.email
    )
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessNameChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessNameChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business name')
  })

  describe('when there is no pending business name change', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '107183280' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessNameChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the DAL update fails', () => {
    beforeEach(() => {
      mockUpdateDalService.mockRejectedValue(new Error('DAL unavailable'))
    })

    test('propagates the error without clearing session or notifying', async () => {
      await expect(updateBusinessNameChangeService(yar, credentials)).rejects.toThrow('DAL unavailable')

      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
