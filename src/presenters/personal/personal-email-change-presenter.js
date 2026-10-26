/**
 * Formats data ready for presenting in the `/customer/{crn}/account-email-change` page
 *
 * @module personalEmailChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-email-change` page
 *
 * @param {object} data - The customer data, including any pending email change held in the session
 * @param {string} [payload] - The email address submitted by the user, when the form is re-rendered after a validation failure
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalEmailChangePresenter = (data, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What is your personal email address?',
    metaDescription: 'Update the email address for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    personalEmail: payload ?? data.changePersonalEmail ?? data.email
  }
}

export {
  personalEmailChangePresenter
}
