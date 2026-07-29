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

import { mutations } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalPhoneNumbersChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPhoneNumbers')

  console.log('[DEBUG] personalDetails from DAL:', JSON.stringify(personalDetails, null, 2))

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

  console.log('[DEBUG] mutation variables payload:', JSON.stringify(variables, null, 2))

  await updateDalService(mutations.updateCustomerPhone, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your personal phone numbers')
}

export {
  updatePersonalPhoneNumbersChangeService
}
