// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Engine dependencies
import { constants, mutations } from '@defra/fcp-sfd-frontend-engine'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Thing under test
import { updatePersonalDobChangeService } from '../../../../src/services/personal/update-personal-dob-change-service.js'

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

describe('updatePersonalDobChangeService', () => {
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
      changePersonalDob: {
        day: '23',
        month: '07',
        year: '1964'
      }
    }

    fetchPersonalChangeService.mockResolvedValue(data)

    yar = { clear: vi.fn() }
  })

  describe('when called', () => {
    test('it fetches the personal details with the crn and email', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(fetchPersonalChangeService).toHaveBeenCalledWith(yar, crn, email, 'changePersonalDob')
    })

    test('it calls updateDalService with the correct mutation and variables', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerDob, {
        input: {
          dateOfBirth: '1964-07-23',
          crn
        }
      }, email)
    })

    test('it clears the personalDetailsUpdate from session', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(yar.clear).toHaveBeenCalledWith('personalDetailsUpdate')
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', constants.successMessages.PERSONAL_DOB)
    })
  })

  describe('when there is no changePersonalDob in session data', () => {
    beforeEach(() => {
      data.changePersonalDob = undefined
    })

    test('it returns early and does not call updateDalService', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(updateDalService).not.toHaveBeenCalled()
    })

    test('it does not add a flash notification', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(flashNotification).not.toHaveBeenCalled()
    })

    test('it does not clear personalDetailsUpdate from session', async () => {
      await updatePersonalDobChangeService(yar, crn, email)

      expect(yar.clear).not.toHaveBeenCalled()
    })
  })
})
