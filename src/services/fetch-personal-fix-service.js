/**
 * Fetches personal details and overlays any in-progress fixes from the personal
 * fix journey stored in session.
 *
 * @module fetchPersonalFixService
 */

import { fetchPersonalDetailsService } from './fetch-personal-details-service.js'

/**
 * Fetches personal details and overlays any in-progress fixes from the personal
 * fix journey stored in session.
 *
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 * @param {object} [sessionData] - The fix journey session data (`orderedSectionsToFix`, `personalFixUpdates`, `source`)
 *
 * @returns {Promise<object>} The personal details, with any pending fixes set against their `changePersonal*` fields
 */
const fetchPersonalFixService = async (crn, email, sessionData = {}) => {
  // These get set during the initialisation service for the interrupter journey
  const { orderedSectionsToFix, personalFixUpdates, source } = sessionData

  const personalDetails = await fetchPersonalDetailsService(crn, email)

  const updatedPersonalDetails = {
    source,
    orderedSectionsToFix,
    ...personalDetails
  }

  if (!personalFixUpdates) {
    return updatedPersonalDetails
  }

  // Merge each changed section into the live details
  if (personalFixUpdates.name) {
    updatedPersonalDetails.changePersonalName = personalFixUpdates.name
  }

  if (personalFixUpdates.dob) {
    updatedPersonalDetails.changePersonalDob = personalFixUpdates.dob
  }

  if (personalFixUpdates.email) {
    updatedPersonalDetails.changePersonalEmail = personalFixUpdates.email
  }

  if (personalFixUpdates.phone) {
    updatedPersonalDetails.changePersonalPhoneNumbers = personalFixUpdates.phone
  }

  if (personalFixUpdates.address) {
    updatedPersonalDetails.changePersonalAddress = personalFixUpdates.address
  }

  return updatedPersonalDetails
}

export {
  fetchPersonalFixService
}
