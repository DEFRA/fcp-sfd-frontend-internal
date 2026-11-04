/**
 * Formats data ready for presenting in the `/customer/{crn}/account-address-change` page
 *
 * @module personalAddressChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-address-change` page
 *
 * The postcode shown is, in order of preference, the submitted payload, the postcode held in the
 * session for the pending change, or the current personal address postcode.
 *
 * @param {object} data - The customer data, including any pending postcode change held in the session
 * @param {string} [payload] - The postcode submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const personalAddressChangePresenter = (data, payload) => {
  const crn = data.crn

  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    manualAddressLink: `/customer/${crn}/account-address-enter`,
    pageTitle: 'What is your personal address?',
    metaDescription: 'Update the address for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    postcode: payload ?? data.changePersonalPostcode?.postcode ?? data.address.postcode
  }
}

export {
  personalAddressChangePresenter
}
