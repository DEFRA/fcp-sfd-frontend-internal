import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

/**
 * Fetches the latest business details from the DAL and merges in a temporary change stored in the user's session
 * for a specific field like businessEmail, businessAddress, businessPhoneNumbers, businessName
 *
 * For example, if the user has typed a new business name but hasn’t saved it yet, this will return
 * the fresh business details with that new name included (changeBusinessName).
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} email - The authenticated user's email
 * @param {string|string[]} fields - The input field(s) the user has updated that we want to fetch (if exists)
 */
const fetchBusinessChangeService = async (yar, email, fields) => {
  const sessionData = yar.get('businessDetailsUpdate') || {}
  const businessDetails = await fetchBusinessDetailsService(sessionData.sbi, email)

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
