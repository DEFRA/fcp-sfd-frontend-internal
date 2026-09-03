// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Engine dependencies
import { mutations } from '@defra/fcp-sfd-frontend-engine'

// Things we need to mock
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Thing under test
import { updatePersonalPhoneNumbersChangeService } from '../../../../src/services/personal/update-personal-phone-numbers-change-service.js'

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

describe('updatePersonalPhoneNumbersChangeService', () => {
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
      contact: { telephone: '01111111111', mobile: '02222222222' },
      changePersonalPhoneNumbers: {
        personalTelephone: '09876543210',
        personalMobile: '07123456789'
      }
    }

    fetchPersonalChangeService.mockResolvedValue(data)

    yar = { clear: vi.fn() }
  })

  describe('when called', () => {
    test('it fetches the personal details with the crn and email', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(fetchPersonalChangeService).toHaveBeenCalledWith(yar, crn, email, 'changePersonalPhoneNumbers')
    })

    test('it calls updateDalService with the correct mutation and variables', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerPhone, {
        input: {
          phone: {
            landline: '09876543210',
            mobile: '07123456789'
          },
          crn
        }
      }, email)
    })

    test('it clears the personalDetailsUpdate from session', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(yar.clear).toHaveBeenCalledWith('personalDetailsUpdate')
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your personal phone numbers')
    })
  })

  describe('when a phone number is null', () => {
    beforeEach(() => {
      data.changePersonalPhoneNumbers.personalTelephone = null
    })

    test('it calls updateDalService with a null landline', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerPhone, {
        input: {
          phone: {
            landline: null,
            mobile: '07123456789'
          },
          crn
        }
      }, email)
    })
  })

  describe('when the mobile number is null', () => {
    beforeEach(() => {
      data.changePersonalPhoneNumbers.personalMobile = null
    })

    test('it calls updateDalService with a null mobile', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerPhone, {
        input: {
          phone: {
            landline: '09876543210',
            mobile: null
          },
          crn
        }
      }, email)
    })
  })

  describe('when there is no changePersonalPhoneNumbers in session data', () => {
    beforeEach(() => {
      data.changePersonalPhoneNumbers = undefined
    })

    test('it returns early and does not call updateDalService', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(updateDalService).not.toHaveBeenCalled()
    })

    test('it does not add a flash notification', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(flashNotification).not.toHaveBeenCalled()
    })

    test('it does not clear personalDetailsUpdate from session', async () => {
      await updatePersonalPhoneNumbersChangeService(yar, crn, email)

      expect(yar.clear).not.toHaveBeenCalled()
    })
  })
})
