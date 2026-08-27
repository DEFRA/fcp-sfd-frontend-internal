/**
 * Base presenter for formatting data for display
 */

import { SEARCH_SBI, SEARCH_CRN } from '../constants/search-links.js'

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

/**
 * Formats the business/customer breadcrumb label used on overview and details pages.
 *
 * @param {string} name - The business or customer name
 * @param {string} idLabel - The label for the identifier, e.g. 'SBI' or 'CRN'
 * @param {string} id - The SBI or CRN value
 *
 * @returns {string} e.g. "Alfred Waldron (CRN: 1101996862)" or "SBI: 123456789" when there's no name
 */
export const formatBreadcrumbLabel = (name, idLabel, id) => {
  return name ? `${name} (${idLabel}: ${id})` : `${idLabel}: ${id}`
}

/**
 * Builds the "Search results" > entity breadcrumb trail used on overview and details pages.
 *
 * @param {string} queryKey - Query string key for the id on the search results link, e.g. 'sbi' or 'crn'
 * @param {string} name - The business or customer name
 * @param {string} id - The SBI or CRN value
 * @param {string} [currentHref] - Href for the current page crumb, omitted when the crumb isn't a link
 *
 * @returns {Array<Object>} Breadcrumb items
 */
export const buildEntityBreadcrumbs = (queryKey, id, name, currentHref) => {
  let searchPath = SEARCH_SBI
  let idLabel = 'SBI'

  if (queryKey === 'crn') {
    searchPath = SEARCH_CRN
    idLabel = 'CRN'
  }

  if (!id) {
    return [{ text: 'Search results', href: searchPath }]
  }

  const crumb = { text: formatBreadcrumbLabel(name, idLabel, id) }

  if (currentHref) {
    crumb.href = currentHref
  }

  return [{ text: 'Search results', href: `${searchPath}?${queryKey}=${id}` }, crumb]
}
