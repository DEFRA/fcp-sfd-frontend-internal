/**
 * Fetches business details and overlays any in-progress fixes from the business
 * fix journey stored in session.
 * @module fetchBusinessFixService
 */

import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

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
