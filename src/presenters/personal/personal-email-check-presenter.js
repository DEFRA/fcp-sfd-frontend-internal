/**
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-email-check` page
 * @module personalEmailCheckPresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

const personalEmailCheckPresenter = (data, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/account-email-change` : SEARCH_CRN,
    changeLink: `/customer/${crn}/account-email-change`,
    pageTitle: 'Check your personal email address is correct before submitting',
    metaDescription: 'Check the email address for your personal account is correct.',
    userName: data.info.userName ?? null,
    crn: crn ?? null,
    personalEmail: data.changePersonalEmail ?? data.contact.email
  }
}

export {
  personalEmailCheckPresenter
}
