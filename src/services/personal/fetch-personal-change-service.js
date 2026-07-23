import { fetchPersonalDetailsService } from '../fetch-personal-details-service.js'

/**
 * Fetches the latest personal details from the DAL and merges in a temporary change stored in the user's session
 * for a specific field like changePersonalName.
 *
 * For example, if the user has typed a new name but hasn't saved it yet, this will return the fresh personal
 * details with that new name included (changePersonalName).
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} crn - The customer reference number of the customer being viewed
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 * @param {string|string[]} fields - The input field(s) the user has updated that we want to fetch (if exists)
 */
const fetchPersonalChangeService = async (yar, crn, email, fields) => {
  const personalDetails = await fetchPersonalDetailsService(crn, email)
  const sessionData = yar.get('personalDetailsUpdate') || {}

  // Normalise to array
  const fieldsToCheck = Array.isArray(fields) ? fields : [fields]

  for (const field of fieldsToCheck) {
    if (sessionData[field] !== undefined) {
      personalDetails[field] = sessionData[field]
    }
  }

  return personalDetails
}

export {
  fetchPersonalChangeService
}
