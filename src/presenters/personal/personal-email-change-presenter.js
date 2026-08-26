/*
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-email-change` page
 * @module personalEmailChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

const personalEmailChangePresenter = (personalDetails, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What is your personal email address?',
    metaDescription: 'Update the email address for your personal account.',
    userName: personalDetails.info.userName ?? null,
    crn: crn ?? null,
    personalEmail: payload ?? personalDetails.changePersonalEmail ?? personalDetails.contact.email
  }
}

export {
  personalEmailChangePresenter
}
