// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessFixService } from '../../../../src/services/business/fetch-business-fix-service.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'

// Thing under test
import { updateBusinessFixService } from '../../../../src/services/business/update-business-fix-service.js'

// Test helpers
import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  services: {
    buildFixSuccessMessage: vi.fn(),
    buildBusinessFixUpdateVariables: vi.fn()
  },
  mutations: {
    updateBusinessDetails: 'updateBusinessDetails'
  }
}))

vi.mock('../../../../src/services/business/fetch-business-fix-service.js', () => ({
  fetchBusinessFixService: vi.fn()
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

describe('updateBusinessFixService', () => {
  let sessionData
  let yar
  let sbi
  let email
  let businessDetails
  let updateVariables

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = { some: 'session-data' }

    yar = {
      clear: vi.fn()
    }

    sbi = '107183280'
    email = 'test.user@defra.gov.uk'

    businessDetails = {
      info: { sbi },
      changeBusinessEmail: { businessEmail: 'new@email.com' },
      orderedSectionsToFix: ['email']
    }

    updateVariables = {
      input: { sbi, email: { address: 'new@email.com' } }
    }

    fetchBusinessFixService.mockResolvedValue(businessDetails)
    services.buildBusinessFixUpdateVariables.mockReturnValue(updateVariables)
    services.buildFixSuccessMessage.mockReturnValue({
      type: 'text',
      value: 'You have updated your business email address'
    })
  })

  describe('when called', () => {
    test('it fetches the business details using sbi, email and session data', async () => {
      await updateBusinessFixService(sbi, sessionData, yar, email)

      expect(fetchBusinessFixService).toHaveBeenCalledWith(sbi, email, sessionData)
    })

    test('it builds mutation variables from the business details', async () => {
      await updateBusinessFixService(sbi, sessionData, yar, email)

      expect(services.buildBusinessFixUpdateVariables).toHaveBeenCalledWith(businessDetails)
    })

    test('it calls the DAL update service with the unified mutation and variables', async () => {
      await updateBusinessFixService(sbi, sessionData, yar, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateBusinessDetails, updateVariables, email)
    })

    test('it builds the success message for the business journey', async () => {
      await updateBusinessFixService(sbi, sessionData, yar, email)

      expect(services.buildFixSuccessMessage).toHaveBeenCalledWith('business', businessDetails)
    })

    test('it flashes a success notification', async () => {
      await updateBusinessFixService(sbi, sessionData, yar, email)

      expect(flashNotification).toHaveBeenCalledWith(
        yar,
        'Success',
        'You have updated your business email address'
      )
    })

    describe('when the success message is html', () => {
      beforeEach(() => {
        services.buildFixSuccessMessage.mockReturnValue({
          type: 'html',
          value: '<p>You have updated your business email address</p>'
        })
      })

      test('it flashes a success notification with html content', async () => {
        await updateBusinessFixService(sbi, sessionData, yar, email)

        expect(flashNotification).toHaveBeenCalledWith(
          yar,
          'Success',
          null,
          '<p>You have updated your business email address</p>'
        )
      })
    })
  })
})
