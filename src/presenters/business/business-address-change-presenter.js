/**
 * Formats data ready for presenting in the `/business/{sbi}/address-change` page
 *
 * @module businessAddressChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/address-change` page
 *
 * The postcode shown is, in order of preference, the submitted payload, the postcode held in the
 * session for the pending change, or the current business address postcode.
 *
 * @param {object} data - The business data, including any pending changes held in the session
 * @param {string} [payload] - The postcode submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessAddressChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    manualAddressLink: `/business/${sbi}/address-enter`,
    pageTitle: 'What is your business address?',
    metaDescription: 'Update the address for your business.',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    postcode: payload ?? data.changeBusinessPostcode?.postcode ?? data.address.postcode
  }
}

export {
  businessAddressChangePresenter
}
