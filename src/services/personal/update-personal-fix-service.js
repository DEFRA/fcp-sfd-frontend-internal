/**
 * Service to update a customer's personal details via the fix journey.
 *
 * Fetches the pending personal fixes from the session
 * Calls the DAL to persist the updated details using updateDalService
 * Displays a success flash notification to the user
 *
 * @module updatePersonalFixService
 */

import { fetchPersonalFixService } from '../fetch-personal-fix-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'
import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

const updatePersonalFixService = async (crn, sessionData, yar, email) => {
  const personalDetails = await fetchPersonalFixService(crn, email, sessionData)
  const variables = services.buildCustomerFixUpdateVariables(personalDetails)

  await updateDalService(mutations.updateCustomerDetails, variables, email)

  const message = services.buildFixSuccessMessage('personal', personalDetails)

  if (message.type === 'html') {
    flashNotification(yar, 'Success', null, message.value)
  } else {
    flashNotification(yar, 'Success', message.value)
  }
}

export {
  updatePersonalFixService
}
