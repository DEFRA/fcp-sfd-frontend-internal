/**
 * Service to update personal phone numbers (landline and mobile)
 *
 * Fetches the pending personal phone number changes from the session
 * Calls the DAL to persist the updated phone numbers using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalPhoneNumbersChangeService
 */

import { constants, mutations } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalPhoneNumbersChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPhoneNumbers')

  if (!personalDetails.changePersonalPhoneNumbers) {
    return
  }

  const variables = {
    input: {
      phone: {
        landline: personalDetails.changePersonalPhoneNumbers.personalTelephone ?? null,
        mobile: personalDetails.changePersonalPhoneNumbers.personalMobile ?? null
      },
      crn: personalDetails.crn
    }
  }

  await updateDalService(mutations.updateCustomerPhone, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.PERSONAL_PHONE_NUMBERS)
}

export {
  updatePersonalPhoneNumbersChangeService
}
