/**
 * Service to update personal date of birth
 *
 * Fetches the pending personal dob changes from the session
 * Calls the DAL to persist the updated date of birth using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalDobChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

/**
 * Service to update personal date of birth
 *
 * Does nothing if there is no pending date of birth change.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<void>}
 */
const updatePersonalDobChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalDob')

  if (!personalDetails.changePersonalDob) {
    return
  }

  const { day, month, year } = personalDetails.changePersonalDob

  const variables = utils.buildUpdateCustomerDobVariables(day, month, year, crn)

  await updateDalService(mutations.updateCustomerDob, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.PERSONAL_DOB)
}

export {
  updatePersonalDobChangeService
}
