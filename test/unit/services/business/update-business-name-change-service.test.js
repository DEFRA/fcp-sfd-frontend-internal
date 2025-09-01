// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { dalConnector } from '../../../../src/dal/connector.js'
import { updateBusinessNameMutation } from '../../../../src/dal/mutations/update-business-name.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details.js'

// Thing under test
import { updateBusinessNameChangeService } from '../../../../src/services/business/update-business-name-change-service'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

vi.mock('../../../../src/dal/connector.js', () => ({
  dalConnector: vi.fn().mockResolvedValue({
    data: {
      updateBusinessName: {
        business: {
          info: {
            name: 'My New Business 123'
          }
        }
      }
    }
  })
}))

describe('updateBusinessNameChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    mappedData.changeBusinessName = 'New business ltd'
    fetchBusinessDetailsService.mockReturnValue(mappedData)

    yar = {
      set: vi.fn().mockReturnValue()
    }
    credentials = { sbi: '123456789', crn: '987654321' }
  })

  describe('when called', () => {
    test('it correctly saves the data to the session', async () => {
      await updateBusinessNameChangeService(yar, credentials)

      expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
      expect(yar.set).toHaveBeenCalledWith('businessDetails', mappedData)
    })

    test('it calls dalConnector with correct mutation and variable', async () => {
      await updateBusinessNameChangeService(yar, credentials)

      expect(dalConnector).toHaveBeenCalledWith(updateBusinessNameMutation, {
        input: {
          name: 'New business ltd',
          sbi: '107183280'
        }
      })
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updateBusinessNameChangeService(yar, credentials)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business name')
    })
  })

  describe('when an update fails', () => {
    beforeEach(() => {
      dalConnector.mockResolvedValue({
        errors: [{
          message: 'Failed to update'
        }]
      })
    })

    test('rejects with "DAL error from mutation"', async () => {
      await expect(updateBusinessNameChangeService(yar, credentials))
        .rejects.toThrow('DAL error from mutation')
    })
  })
})
