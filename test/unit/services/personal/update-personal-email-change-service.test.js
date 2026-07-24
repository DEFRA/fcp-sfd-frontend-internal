// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { mutations } from '@defra/fcp-sfd-frontend-engine'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Thing under test
import { updatePersonalEmailChangeService } from '../../../../src/services/personal/update-personal-email-change-service.js'

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: vi.fn().mockResolvedValue({})
}))

describe('updatePersonalEmailChangeService', () => {
  let yar
  let crn
  let email
  let data

  beforeEach(() => {
    vi.clearAllMocks()

    crn = '1234567890'
    email = 'test@example.com'

    data = {
      crn,
      info: {
        userName: 'John Doe',
        fullName: { first: 'John', last: 'Doe' }
      },
      contact: { email: 'old-email@test.com' },
      changePersonalEmail: 'new-email@test.com'
    }

    fetchPersonalChangeService.mockResolvedValue(data)

    yar = { clear: vi.fn() }
  })

  describe('when called', () => {
    test('it fetches the personal details with the crn and email', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(fetchPersonalChangeService).toHaveBeenCalledWith(yar, crn, email, 'changePersonalEmail')
    })

    test('it calls updateDalService with the correct mutation and variables', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerEmail, {
        input: {
          email: {
            address: 'new-email@test.com'
          },
          crn
        }
      }, email)
    })

    test('it clears the personalDetailsUpdate from session', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(yar.clear).toHaveBeenCalledWith('personalDetailsUpdate')
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your personal email address')
    })
  })

  describe('when there is no changePersonalEmail in session data', () => {
    beforeEach(() => {
      data.changePersonalEmail = undefined
    })

    test('it returns early and does not call updateDalService', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(updateDalService).not.toHaveBeenCalled()
    })

    test('it does not add a flash notification', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(flashNotification).not.toHaveBeenCalled()
    })

    test('it does not clear personalDetailsUpdate from session', async () => {
      await updatePersonalEmailChangeService(yar, crn, email)

      expect(yar.clear).not.toHaveBeenCalled()
    })
  })
})
