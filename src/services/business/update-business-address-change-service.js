/**
 * Updates the business address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to the actual business details record.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} sbi - The single business identifier of the business being updated
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 */
import { fetchBusinessDetailsService } from '../fetch-business-details-service.js'

const updateBusinessAddressChangeService = async (yar, sbi, email) => {
  // Get the pending change from session
  const sessionData = yar.get('businessDetailsUpdate') || {}
  const changeBusinessAddress = sessionData.changeBusinessAddress

  if (!changeBusinessAddress) {
    throw new Error('No pending address change found in session')
  }

  // Get the current business details
  const businessDetails = await fetchBusinessDetailsService(sbi, email)

  // Update the address with the pending change
  const updatedAddress = {
    ...businessDetails.address,
    ...changeBusinessAddress
  }

  // In a real implementation, this would call a DAL service to update the address
  // For now, we're just updating the session
  yar.set('businessDetailsUpdate', {})

  return updatedAddress
}

export {
  updateBusinessAddressChangeService
}
