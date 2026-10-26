/**
 * Service to update a personal full name (first, last and middle)
 *
 * Fetches the pending personal name changes from the session
 * Calls the DAL to persist the updated name fields using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalNameChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

/**
 * Service to update a personal full name (first, last and middle)
 *
 * Does nothing if there is no pending name change.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updatePersonalNameChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalName')

  if (!personalDetails.changePersonalName) {
    return
  }

  const { first, last, middle } = personalDetails.changePersonalName

  const variables = utils.buildUpdateCustomerNameVariables(first, last, middle, personalDetails.crn)

  await updateDalService(mutations.updateCustomerName, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.PERSONAL_NAME)
}

export {
  updatePersonalNameChangeService
}
