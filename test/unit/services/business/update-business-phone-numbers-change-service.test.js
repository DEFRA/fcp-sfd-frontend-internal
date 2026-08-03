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
  mutations: { updateBusinessPhoneNumbers: 'update-business-phone-numbers-mutation' },
  utils: {
    buildUpdateBusinessPhoneNumbersVariables: (businessTelephone, businessMobile, sbi) => ({
      input: {
        phone: {
          landline: businessTelephone ?? null,
          mobile: businessMobile ?? null
        },
        sbi
      }
    })
  },
  constants: {
    successMessages: { BUSINESS_PHONE_NUMBERS: 'You have updated your business phone numbers' }
  }
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessPhoneNumbersChangeService } = await import('../../../../src/services/business/update-business-phone-numbers-change-service.js')

describe('updateBusinessPhoneNumbersChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessPhoneNumbers: {
        businessMobile: '09876 543210',
        businessTelephone: '01111 111111'
      },
      info: {
        sbi: '106705779'
      }
    })
  })

  test('fetches the pending business phone numbers change from session', async () => {
    await updateBusinessPhoneNumbersChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessPhoneNumbers')
  })

  test('persists the updated phone numbers via the DAL', async () => {
    await updateBusinessPhoneNumbersChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenCalledWith(
      'update-business-phone-numbers-mutation',
      { input: { phone: { landline: '01111 111111', mobile: '09876 543210' }, sbi: '106705779' } },
      credentials.email
    )
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessPhoneNumbersChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessPhoneNumbersChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business phone numbers')
  })

  describe('when there is no pending business phone numbers change', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '106705779' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessPhoneNumbersChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
