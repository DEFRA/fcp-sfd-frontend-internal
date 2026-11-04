/**
 * Service to update a business's email address
 *
 * Fetches the pending business email change from the session
 * Calls the DAL to persist the updated email using updateDalService
 * Clears the cached business details data from the session
 * Displays a success flash notification to the user
 *
 * @module updateBusinessEmailChangeService
 */

import { mutations, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { updateDalService } from '../DAL/update-dal-service.js'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

/**
 * Service to update a business's email address
 *
 * Does nothing if there is no pending email change.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} sbi - The Single Business Identifier
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updateBusinessEmailChangeService = async (yar, sbi, email) => {
  const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessEmail')

  if (!businessDetails.changeBusinessEmail) {
    return
  }

  const variables = utils.buildUpdateBusinessEmailVariables(businessDetails.changeBusinessEmail, businessDetails.sbi)

  await updateDalService(mutations.updateBusinessEmail, variables, email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_EMAIL_ADDRESS)
}

export {
  updateBusinessEmailChangeService
}
