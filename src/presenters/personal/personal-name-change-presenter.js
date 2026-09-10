/*
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-name-change` page
 * @module personalNameChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

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
