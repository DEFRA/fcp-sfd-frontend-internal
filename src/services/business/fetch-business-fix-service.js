/**
 * Fetches business details and overlays any in-progress fixes from the business
 * fix journey stored in session.
 *
 * @module fetchBusinessFixService
 */

import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

/**
 * Fetches business details and overlays any in-progress fixes from the business
 * fix journey stored in session.
 *
 * @param {string} sbi - The Single Business Identifier
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 * @param {object} [sessionData] - The fix journey session data (`orderedSectionsToFix`, `businessFixUpdates`, `source`)
 *
 * @returns {Promise<object>} The business details, with any pending fixes set against their `change*` fields
 */
const fetchBusinessFixService = async (sbi, email, sessionData = {}) => {
  // These get set during the initialisation service for the interrupter journey
  const { orderedSectionsToFix, businessFixUpdates, source } = sessionData

  const businessDetails = await fetchBusinessDetailsService(sbi, email)

  const updatedBusinessDetails = {
    source,
    orderedSectionsToFix,
    ...businessDetails
  }

  if (!businessFixUpdates) {
    return updatedBusinessDetails
  }

  // Merge each changed section into the live details
  if (businessFixUpdates.name) {
    updatedBusinessDetails.changeBusinessName = businessFixUpdates.name
  }

  if (businessFixUpdates.address) {
    updatedBusinessDetails.changeBusinessAddress = businessFixUpdates.address
  }

  if (businessFixUpdates.phone) {
    updatedBusinessDetails.changeBusinessPhoneNumbers = businessFixUpdates.phone
  }

  if (businessFixUpdates.email) {
    updatedBusinessDetails.changeBusinessEmail = businessFixUpdates.email
  }

  if (businessFixUpdates.vat) {
    updatedBusinessDetails.changeBusinessVat = businessFixUpdates.vat
  }

  return updatedBusinessDetails
}

export {
  fetchBusinessFixService
}
