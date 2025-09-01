/**
 * Identify the correct address to use from the DAL response.
 *
 * An address lookup is where a user enters a postcode and selects an address
 * returned from an API. Manual input is when a user chooses to type the address in themselves.
 *
 * If any field in the address lookup is present (non-null), we assume the user selected an address from the lookup.
 * Otherwise we use the manually entered address.
 *
 * If both a building number range and a street are present, they are combined into one line to ensure they are
 * displayed together.
 *
 * Postcode and country and always appended to the final address array.
 *
 * @param {Object} address - The complete address object
 *
 * @returns {string[]} An array of address fields (either from lookup or manual)
 *
 * @private
 */

const formatAddress = (address) => {
  const { lookup, manual, postcode, country } = address

  const validLookupAddress = Object.values(lookup).some(values => values !== null)
  const userAddress = validLookupAddress ? lookup : manual

  if (userAddress.buildingNumberRange && userAddress.street) {
    // without this the number and street are separate entities and displayed on separate lines
    userAddress.street = `${userAddress.buildingNumberRange} ${userAddress.street}`
    userAddress.buildingNumberRange = null
  }

  // Remove any null values from the final address object
  const filteredUserAddress = Object.values(userAddress).filter(Boolean)

  return [
    ...filteredUserAddress,
    postcode,
    country
  ]
}

export const addressPresenter = {
  formatAddress
}
