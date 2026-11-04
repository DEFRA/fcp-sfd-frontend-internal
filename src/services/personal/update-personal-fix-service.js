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

/**
 * Service to update a customer's personal details via the fix journey.
 *
 * The flash notification is HTML or plain text depending on the type of success message built for the fixed sections.
 *
 * @param {string} crn - The customer reference number
 * @param {object} sessionData - The fix journey session data (`orderedSectionsToFix`, `personalFixUpdates`, `source`)
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updatePersonalFixService = async (crn, sessionData, yar, email) => {
  const personalDetails = await fetchPersonalFixService(crn, email, sessionData)
  const variables = services.buildCustomerFixUpdateVariables(personalDetails)

  await updateDalService(mutations.updateCustomerDetails, variables, email)

  const message = services.buildFixSuccessMessage('personal', personalDetails)

  if (!message) {
    return
  }

  if (message.type === 'html') {
    flashNotification(yar, 'Success', null, message.value)
  } else {
    flashNotification(yar, 'Success', message.value)
  }
}

export {
  updatePersonalFixService
}
