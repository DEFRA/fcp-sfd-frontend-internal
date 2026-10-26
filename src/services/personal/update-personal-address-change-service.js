/**
 * Updates the personal address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual personal details record.
 *
 * @module updatePersonalAddressChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

/**
 * Updates the personal address details through the DAL service.
 *
 * Does nothing if there is no pending address change. Otherwise clears the pending change from the session and
 * flashes a success notification.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updatePersonalAddressChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')

  if (!personalDetails.changePersonalAddress) {
    return
  }

  const variables = utils.buildUpdateCustomerAddressVariables(personalDetails.changePersonalAddress, personalDetails.crn)

  await updateDalService(mutations.updateCustomerAddress, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.PERSONAL_ADDRESS)
}

export {
  updatePersonalAddressChangeService
}
