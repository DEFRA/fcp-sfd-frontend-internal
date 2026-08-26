import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

/**
 * Fetches the latest business details from the DAL and merges in a temporary change stored in the user's session
 * for a specific field like businessEmail, businessAddress, businessPhoneNumbers, businessName
 *
 * For example, if the user has typed a new business name but hasn’t saved it yet, this will return
 * the fresh business details with that new name included (changeBusinessName).
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} sbi - The single business identifier of the business being viewed
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 * @param {string|string[]} fields - The input field(s) the user has updated that we want to fetch (if exists)
 */
const fetchBusinessChangeService = async (yar, sbi, email, fields) => {
  const businessDetails = await fetchBusinessDetailsService(sbi, email)
  const sessionData = yar.get('businessDetailsUpdate') || {}

  // Normalize to array
  const fieldsToCheck = Array.isArray(fields) ? fields : [fields]

  for (const field of fieldsToCheck) {
    if (sessionData[field] !== undefined) {
      businessDetails[field] = sessionData[field]
    }
  }

  return businessDetails
}

export {
  fetchBusinessChangeService
}
