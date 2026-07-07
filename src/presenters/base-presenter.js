/**
 * Base presenter for formatting data for display
 */

const getAddressParts = (address) => {
  const lookup = address.lookup || {}
  const manual = address.manual || {}
  const city = address.city || ''
  const country = address.country || ''

  if (lookup.uprn) {
    const buildingAndStreet = [lookup.buildingNumberRange, lookup.street]
      .filter(Boolean)
      .join(' ')

    return [
      lookup.pafOrganisationName,
      lookup.flatName,
      lookup.buildingName,
      buildingAndStreet,
      lookup.doubleDependentLocality,
      lookup.dependentLocality,
      city,
      lookup.county,
      country
    ]
  }

  return [
    manual.line1,
    manual.line2,
    manual.line3,
    city,
    manual.line4, // County
    manual.line5,
    country
  ]
}

/**
 * Formats an address object into a comma-separated address string and a separate postcode.
 *
 * If the address contains a UPRN, the user selected it from an address lookup.
 * Otherwise it is treated as a manually entered address.
 *
 * The postcode is always returned separately so views can render it on its own line.
 *
 * @param {Object} address - The address object from the mapped DAL response
 *
 * @returns {{ addressLines: string, postcode: string }}
 */
export const formatAddressLines = (address) => {
  if (!address) {
    return { addressLines: '', postcode: '' }
  }

  const postcode = address.postcode || ''
  const lines = getAddressParts(address)

  return {
    addressLines: lines.filter(Boolean).join(', '),
    postcode: postcode || ''
  }
}
