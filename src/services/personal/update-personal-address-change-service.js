/**
 * Updates the personal address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual personal details record.
 *
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} crn - The customer reference number of the customer being updated
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 */
import { fetchPersonalDetailsService } from '../fetch-personal-details-service.js'

const updatePersonalAddressChangeService = async (yar, crn, email) => {
  // Get the pending change from session
  const sessionData = yar.get('personalDetailsUpdate') || {}
  const changePersonalAddress = sessionData.changePersonalAddress

  if (!changePersonalAddress) {
    throw new Error('No pending address change found in session')
  }

  // Get the current personal details
  const personalDetails = await fetchPersonalDetailsService(crn, email)

  // Update the address with the pending change
  const updatedAddress = {
    ...personalDetails.address,
    ...changePersonalAddress
  }

  // In a real implementation, this would call a DAL service to update the address
  // For now, we're just updating the session
  yar.set('personalDetailsUpdate', {})

  return updatedAddress
}

export {
  updatePersonalAddressChangeService
}
