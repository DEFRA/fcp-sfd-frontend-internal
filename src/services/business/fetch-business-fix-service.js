/**
 * Fetches business details and overlays any in-progress fixes from the business
 * fix journey stored in session.
 * @module fetchBusinessFixService
 */

import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

const fetchBusinessFixService = async (credentials, sessionData = {}) => {
  const { orderedSectionsToFix, businessFixUpdates, source, sbi } = sessionData
  const businessDetails = await fetchBusinessDetailsService(sbi, credentials.email)

  const updatedBusinessDetails = {
    source,
    orderedSectionsToFix,
    ...businessDetails
  }

  if (!businessFixUpdates) {
    return updatedBusinessDetails
  }

  // Merge each changed section into the live details
  if (businessFixUpdates.email) {
    updatedBusinessDetails.changeBusinessEmail = businessFixUpdates.email
  }

  return updatedBusinessDetails
}

export {
  fetchBusinessFixService
}
