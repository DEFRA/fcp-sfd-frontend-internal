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

vi.mock('../../../../src/dal/mutations/business/update-business-email.js', () => ({
  updateBusinessEmailMutation: 'update-business-email-mutation'
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessEmailChangeService } = await import('../../../../src/services/business/update-business-email-change-service.js')

describe('updateBusinessEmailChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessEmail: 'new@example.com',
      info: { sbi: '107183280' }
    })
  })

  test('fetches the pending business email change from session', async () => {
    await updateBusinessEmailChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessEmail')
  })

  test('persists the updated email via the DAL', async () => {
    await updateBusinessEmailChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenCalledWith(
      'update-business-email-mutation',
      { input: { email: { address: 'new@example.com' }, sbi: '107183280' } },
      credentials.email
    )
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessEmailChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessEmailChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business email address')
  })

  describe('when there is no pending business email change', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '107183280' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessEmailChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
