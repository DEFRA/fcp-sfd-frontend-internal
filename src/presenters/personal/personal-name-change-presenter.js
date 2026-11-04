/**
 * Formats data ready for presenting in the `/customer/{crn}/account-name-change` page
 *
 * @module personalNameChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-name-change` page
 *
 * Each name part is, in order of preference, the submitted payload, the pending change held in the
 * session, or the current name.
 *
 * @param {object} data - The customer data, including any pending name change held in the session
 * @param {object} [payload] - The name parts submitted by the user, when the form is re-rendered after a validation failure
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalNameChangePresenter = (data, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What is your full name?',
    metaDescription: 'Update the full name for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    first: payload?.first ?? data.changePersonalName?.first ?? data.fullName.first,
    middle: payload?.middle ?? data.changePersonalName?.middle ?? data.fullName.middle,
    last: payload?.last ?? data.changePersonalName?.last ?? data.fullName.last
  }
}

export {
  personalNameChangePresenter
}
