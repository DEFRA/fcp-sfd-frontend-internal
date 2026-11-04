/**
 * Formats data ready for presenting in the `/customer/{crn}/account-email-check` page
 *
 * @module personalEmailCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-email-check` page
 *
 * @param {object} data - The customer data, including any pending email change held in the session
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalEmailCheckPresenter = (data, crn) => {
  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalEmail(crn) : SEARCH_CRN,
    changeLink: PERSONAL_CHANGE_LINKS.personalEmail(crn),
    pageTitle: 'Check your personal email address is correct before submitting',
    metaDescription: 'Check the email address for your personal account is correct.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    personalEmail: data.changePersonalEmail ?? data.email
  }
}

export {
  personalEmailCheckPresenter
}
