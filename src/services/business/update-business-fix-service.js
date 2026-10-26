/**
 * Service to update a business's details via the fix journey.
 *
 * Fetches the pending business fixes from the session
 * Calls the DAL to persist the updated details using updateDalService
 * Displays a success flash notification to the user
 *
 * @module updateBusinessFixService
 */

import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessFixService } from './fetch-business-fix-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

/**
 * Service to update a business's details via the fix journey.
 *
 * The flash notification is HTML or plain text depending on the type of success message built for the fixed sections.
 *
 * @param {string} sbi - The Single Business Identifier
 * @param {object} sessionData - The fix journey session data (`orderedSectionsToFix`, `businessFixUpdates`, `source`)
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updateBusinessFixService = async (sbi, sessionData, yar, email) => {
  const businessDetails = await fetchBusinessFixService(sbi, email, sessionData)
  const variables = services.buildBusinessFixUpdateVariables(businessDetails)

  await updateDalService(mutations.updateBusinessDetails, variables, email)

  const message = services.buildFixSuccessMessage('business', businessDetails)

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
  updateBusinessFixService
}
