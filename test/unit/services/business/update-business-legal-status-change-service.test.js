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
  mutations: {
    updateBusinessLegalStatus: 'update-business-legal-status-mutation',
    updateBusinessRegistrationNumbers: 'update-business-registration-numbers-mutation'
  },
  constants: {
    business: {
      CHARITY_REGISTRATION_LEGAL_STATUS_CODES: ['102101'],
      COMPANY_REGISTRATION_LEGAL_STATUS_CODES: ['102105']
    },
    successMessages: { BUSINESS_LEGAL_STATUS: 'You have updated your business legal status' }
  }
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: mockFlashNotification
}))

// Thing under test
const { updateBusinessLegalStatusChangeService } = await import('../../../../src/services/business/update-business-legal-status-change-service.js')

describe('updateBusinessLegalStatusChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }

    yar = {
      clear: vi.fn()
    }

    mockFetchBusinessChangeService.mockResolvedValue({
      changeBusinessLegalStatus: '102105',
      changeBusinessCompanyRegistrationNumber: '12345678',
      info: { sbi: '107183280' }
    })

    mockUpdateDalService
      .mockResolvedValueOnce({ data: { updateBusinessLegalStatus: { success: true } } })
      .mockResolvedValueOnce({ data: { updateBusinessRegistrationNumbers: { success: true } } })
  })

  test('fetches the pending legal status change from session', async () => {
    await updateBusinessLegalStatusChangeService(yar, credentials)

    expect(mockFetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, [
      'changeBusinessLegalStatus',
      'changeBusinessCharityCommissionRegistrationNumber',
      'changeBusinessCompanyRegistrationNumber'
    ])
  })

  test('builds both mutation variables and sends legal status before registration numbers', async () => {
    await updateBusinessLegalStatusChangeService(yar, credentials)

    expect(mockUpdateDalService).toHaveBeenNthCalledWith(
      1,
      'update-business-legal-status-mutation',
      {
        input: {
          sbi: '107183280',
          legalStatusCode: 102105
        }
      },
      credentials.email
    )

    expect(mockUpdateDalService).toHaveBeenNthCalledWith(
      2,
      'update-business-registration-numbers-mutation',
      {
        input: {
          sbi: '107183280',
          registrationNumbers: {
            companiesHouse: '12345678',
            charityCommission: null
          }
        }
      },
      credentials.email
    )
  })

  test('clears the cached business details from session', async () => {
    await updateBusinessLegalStatusChangeService(yar, credentials)

    expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
  })

  test('displays a success flash notification', async () => {
    await updateBusinessLegalStatusChangeService(yar, credentials)

    expect(mockFlashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business legal status')
  })

  describe('when the legal status does not require a registration number', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({
        changeBusinessLegalStatus: '102111',
        changeBusinessCompanyRegistrationNumber: '12345678',
        changeBusinessCharityCommissionRegistrationNumber: '7654321',
        info: { sbi: '107183280' }
      })

      mockUpdateDalService
        .mockResolvedValueOnce({ data: { updateBusinessLegalStatus: { success: true } } })
        .mockResolvedValueOnce({ data: { updateBusinessRegistrationNumbers: { success: true } } })
    })

    test('nulls both registration values when they are no longer required', async () => {
      await updateBusinessLegalStatusChangeService(yar, credentials)

      expect(mockUpdateDalService).toHaveBeenNthCalledWith(
        2,
        'update-business-registration-numbers-mutation',
        {
          input: {
            sbi: '107183280',
            registrationNumbers: {
              companiesHouse: null,
              charityCommission: null
            }
          }
        },
        credentials.email
      )
    })
  })

  describe('when the legal status requires a registration number that is only present on the fetched details', () => {
    describe('and the business is a company', () => {
      beforeEach(() => {
        mockFetchBusinessChangeService.mockResolvedValue({
          changeBusinessLegalStatus: '102105',
          info: { sbi: '107183280', registrationNumbers: { companiesHouse: '87654321' } }
        })
      })

      test('sends the fetched registration number when none is pending in session', async () => {
        await updateBusinessLegalStatusChangeService(yar, credentials)

        expect(mockUpdateDalService).toHaveBeenNthCalledWith(
          2,
          'update-business-registration-numbers-mutation',
          {
            input: {
              sbi: '107183280',
              registrationNumbers: {
                companiesHouse: '87654321',
                charityCommission: null
              }
            }
          },
          credentials.email
        )
      })
    })

    describe('and the business is a charity', () => {
      beforeEach(() => {
        mockFetchBusinessChangeService.mockResolvedValue({
          changeBusinessLegalStatus: '102101',
          info: { sbi: '107183280', registrationNumbers: { charityCommission: '7654321' } }
        })
      })

      test('sends the fetched registration number when none is pending in session', async () => {
        await updateBusinessLegalStatusChangeService(yar, credentials)

        expect(mockUpdateDalService).toHaveBeenNthCalledWith(
          2,
          'update-business-registration-numbers-mutation',
          {
            input: {
              sbi: '107183280',
              registrationNumbers: {
                companiesHouse: null,
                charityCommission: '7654321'
              }
            }
          },
          credentials.email
        )
      })
    })
  })

  describe('when neither the legal status nor the registration number have changed', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({ info: { sbi: '107183280' } })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessLegalStatusChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when a registration number is present in session but the current legal status does not require one', () => {
    beforeEach(() => {
      mockFetchBusinessChangeService.mockResolvedValue({
        changeBusinessCompanyRegistrationNumber: '87654321',
        info: { sbi: '107183280', legalStatusCode: '102199' }
      })
    })

    test('returns early without calling the DAL, clearing session or notifying', async () => {
      await updateBusinessLegalStatusChangeService(yar, credentials)

      expect(mockUpdateDalService).not.toHaveBeenCalled()
      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when only the registration number has changed', () => {
    beforeEach(() => {
      mockUpdateDalService.mockReset()
      mockUpdateDalService.mockResolvedValue({ data: { updateBusinessRegistrationNumbers: { success: true } } })
    })

    describe('and the business is a company', () => {
      beforeEach(() => {
        mockFetchBusinessChangeService.mockResolvedValue({
          changeBusinessCompanyRegistrationNumber: '87654321',
          // The legal status is unchanged, so its code comes from the fetched details as a number
          info: { sbi: '107183280', legalStatusCode: 102105 }
        })
      })

      test('sends only the registration numbers mutation', async () => {
        await updateBusinessLegalStatusChangeService(yar, credentials)

        expect(mockUpdateDalService).toHaveBeenCalledTimes(1)
        expect(mockUpdateDalService).toHaveBeenCalledWith(
          'update-business-registration-numbers-mutation',
          {
            input: {
              sbi: '107183280',
              registrationNumbers: {
                companiesHouse: '87654321',
                charityCommission: null
              }
            }
          },
          credentials.email
        )
      })

      test('clears the session and notifies with the company registration number message', async () => {
        await updateBusinessLegalStatusChangeService(yar, credentials)

        expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
        expect(mockFlashNotification).toHaveBeenCalledWith(
          yar,
          'Success',
          'You have updated your company registration number'
        )
      })
    })

    describe('and the business is a charity', () => {
      beforeEach(() => {
        mockFetchBusinessChangeService.mockResolvedValue({
          changeBusinessCharityCommissionRegistrationNumber: '7654321',
          info: { sbi: '107183280', legalStatusCode: 102101 }
        })
      })

      test('sends the charity number and notifies with the charity registration number message', async () => {
        await updateBusinessLegalStatusChangeService(yar, credentials)

        expect(mockUpdateDalService).toHaveBeenCalledWith(
          'update-business-registration-numbers-mutation',
          {
            input: {
              sbi: '107183280',
              registrationNumbers: {
                companiesHouse: null,
                charityCommission: '7654321'
              }
            }
          },
          credentials.email
        )

        expect(mockFlashNotification).toHaveBeenCalledWith(
          yar,
          'Success',
          'You have updated your charity commission registration number'
        )
      })
    })
  })

  describe('when the DAL update fails', () => {
    beforeEach(() => {
      mockUpdateDalService.mockReset()
      mockUpdateDalService.mockRejectedValue(new Error('DAL unavailable'))
    })

    test('propagates the error without clearing session or notifying', async () => {
      await expect(updateBusinessLegalStatusChangeService(yar, credentials)).rejects.toThrow('DAL unavailable')

      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the legal status mutation does not report success', () => {
    beforeEach(() => {
      mockUpdateDalService.mockReset()
      mockUpdateDalService.mockResolvedValueOnce({
        data: {
          updateBusinessLegalStatus: {
            success: false
          }
        }
      })
    })

    test('throws and does not clear session or notify', async () => {
      await expect(updateBusinessLegalStatusChangeService(yar, credentials)).rejects.toThrow(
        'DAL mutation did not succeed: updateBusinessLegalStatus'
      )

      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the registration numbers mutation does not report success', () => {
    beforeEach(() => {
      mockUpdateDalService.mockReset()
      mockUpdateDalService
        .mockResolvedValueOnce({ data: { updateBusinessLegalStatus: { success: true } } })
        .mockResolvedValueOnce({
          data: {
            updateBusinessRegistrationNumbers: {
              success: false
            }
          }
        })
    })

    test('throws and does not clear session or notify', async () => {
      await expect(updateBusinessLegalStatusChangeService(yar, credentials)).rejects.toThrow(
        'DAL mutation did not succeed: updateBusinessRegistrationNumbers'
      )

      expect(yar.clear).not.toHaveBeenCalled()
      expect(mockFlashNotification).not.toHaveBeenCalled()
    })
  })
})
