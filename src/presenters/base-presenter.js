/**
 * Base presenter for formatting data for display
 */

/**
 * Resolves the href for a dynamic "Back" link.
 *
 * Uses the referring page when it is a same-origin, relative path so the user
 * returns to wherever they actually came from. Falls back to a fixed journey
 * URL when there is no referrer, or it's off-site/unparsable (e.g. a direct visit,
 * bookmark, or a browser that doesn't send one).
 *
 * @param {string} referrer - The request's referrer header (`request.info.referrer`)
 * @param {string} fallbackHref - The href to use when the referrer can't be used
 *
 * @returns {string} The href to use for the back link
 */
export const resolveBackLink = (referrer, fallbackHref) => {
  try {
    const { protocol, pathname, search } = new URL(referrer)

    if (protocol !== 'http:' && protocol !== 'https:') {
      return fallbackHref
    }

    return `${pathname}${search}`
  } catch {
    return fallbackHref
  }
}

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
