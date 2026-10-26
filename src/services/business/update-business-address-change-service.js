/**
 * Updates the business address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual business details record.
 *
 * @module updateBusinessAddressChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

/**
 * Updates the business address details through the DAL service.
 *
 * Does nothing if there is no pending address change. Otherwise clears the pending change from the session and
 * flashes a success notification.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} sbi - The Single Business Identifier
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updateBusinessAddressChangeService = async (yar, sbi, email) => {
  const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')

  if (!businessDetails.changeBusinessAddress) {
    return
  }

  const variables = utils.buildUpdateBusinessAddressVariables(businessDetails.changeBusinessAddress, businessDetails.sbi)

  await updateDalService(mutations.updateBusinessAddress, variables, email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_ADDRESS)
}

export {
  updateBusinessAddressChangeService
}
