/**
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-email-check` page
 * @module personalEmailCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

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
