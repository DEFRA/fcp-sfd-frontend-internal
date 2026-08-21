// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessChangeService } from '../../../../src/services/business/fetch-business-change-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details.js'

// Thing under test
import { updateBusinessVatRemoveService } from '../../../../src/services/business/update-business-vat-remove-service.js'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: vi.fn().mockResolvedValue({})
}))

describe('updateBusinessVatRemoveService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    fetchBusinessChangeService.mockResolvedValue(mappedData)

    yar = { clear: vi.fn() }
    credentials = { email: 'test.user@defra.gov.uk' }
  })

  describe('when called', () => {
    test('it fetches the business details from the session and DAL', async () => {
      await updateBusinessVatRemoveService(yar, credentials)

      expect(fetchBusinessChangeService).toHaveBeenCalledWith(yar, credentials, 'changeBusinessVat')
    })

    test('it calls updateDalService with the correct mutation and variables', async () => {
      await updateBusinessVatRemoveService(yar, credentials)

      expect(updateDalService).toHaveBeenCalledWith(expect.stringContaining('updateBusinessVAT'), {
        input: {
          vat: '',
          sbi: '107183280'
        }
      }, credentials.email)
    })

    test('it clears the cached business details from the session', async () => {
      await updateBusinessVatRemoveService(yar, credentials)

      expect(yar.clear).toHaveBeenCalledWith('businessDetailsUpdate')
    })

    test('adds a flash notification confirming the VAT removal', async () => {
      await updateBusinessVatRemoveService(yar, credentials)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have removed your VAT registration number')
    })
  })

  describe('when the DAL rejects the mutation', () => {
    beforeEach(() => {
      updateDalService.mockRejectedValue(new Error('DAL error from mutation'))
    })

    test('propagates the error and leaves the session intact', async () => {
      await expect(updateBusinessVatRemoveService(yar, credentials)).rejects.toThrow('DAL error from mutation')

      expect(yar.clear).not.toHaveBeenCalled()
      expect(flashNotification).not.toHaveBeenCalled()
    })
  })
})
