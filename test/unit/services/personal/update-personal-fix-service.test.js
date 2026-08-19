// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchPersonalFixService } from '../../../../src/services/fetch-personal-fix-service.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'

// Thing under test
import { updatePersonalFixService } from '../../../../src/services/personal/update-personal-fix-service.js'

// Test helpers
import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

// Mocks
vi.mock('../../../../src/services/fetch-personal-fix-service.js', () => ({
  fetchPersonalFixService: vi.fn()
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  services: {
    buildFixSuccessMessage: vi.fn(),
    buildCustomerFixUpdateVariables: vi.fn()
  },
  mutations: {
    updateCustomerDetails: 'updateCustomerDetails'
  }
}))

vi.mock('../../../../src/services/personal/build-personal-fix-update-variables-service.js', () => ({
  buildPersonalFixUpdateVariablesService: vi.fn()
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

describe('updatePersonalFixService', () => {
  let sessionData
  let yar
  let crn
  let email
  let personalDetails
  let updateVariables

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = { some: 'session-data' }

    yar = {
      clear: vi.fn()
    }

    crn = '123456789'
    email = 'test@example.com'

    personalDetails = {
      crn,
      changePersonalEmail: true,
      orderedSectionsToFix: ['email']
    }

    updateVariables = {
      updateCustomerEmailInput: {}
    }

    fetchPersonalFixService.mockResolvedValue(personalDetails)
    services.buildCustomerFixUpdateVariables.mockReturnValue(updateVariables)
    services.buildFixSuccessMessage.mockReturnValue({
      type: 'text',
      value: 'You have updated your personal email address'
    })
  })

  describe('when called', () => {
    test('it fetches the personal details using crn, email and session data', async () => {
      await updatePersonalFixService(crn, sessionData, yar, email)

      expect(fetchPersonalFixService).toHaveBeenCalledWith(crn, email, sessionData)
    })

    test('it builds mutation variables from personal details', async () => {
      await updatePersonalFixService(crn, sessionData, yar, email)

      expect(services.buildCustomerFixUpdateVariables).toHaveBeenCalledWith(personalDetails)
    })

    test('it calls the DAL update service with the correct mutation and variables', async () => {
      await updatePersonalFixService(crn, sessionData, yar, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerDetails, updateVariables, email)
    })

    test('it clears personalDetails from the session', async () => {
      await updatePersonalFixService(crn, sessionData, yar, email)

      expect(yar.clear).toHaveBeenCalledWith('personalDetails')
    })

    test('it flashes a success notification', async () => {
      await updatePersonalFixService(crn, sessionData, yar, email)

      expect(flashNotification).toHaveBeenCalledWith(
        yar,
        'Success',
        'You have updated your personal email address'
      )
    })

    describe('when the success message is html', () => {
      beforeEach(() => {
        services.buildFixSuccessMessage.mockReturnValue({
          type: 'html',
          value: '<p>You have updated your personal email address</p>'
        })
      })

      test('it flashes a success notification with html content', async () => {
        await updatePersonalFixService(crn, sessionData, yar, email)

        expect(flashNotification).toHaveBeenCalledWith(
          yar,
          'Success',
          null,
          '<p>You have updated your personal email address</p>'
        )
      })
    })
  })
})
