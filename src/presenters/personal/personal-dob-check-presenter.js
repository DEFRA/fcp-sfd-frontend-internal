/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-date-of-birth-check` page
 * @module personalDobCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

import { PERSONAL_CHANGE_LINKS } from '../../constants/change-links.js'

const personalDobCheckPresenter = (personalDetails, crn) => {
  const dob = personalDetails.changePersonalDob ?? personalDetails.info.dateOfBirth

  return {
    backLink: { href: PERSONAL_CHANGE_LINKS.personalDob(crn) },
    pageTitle: 'Check your date of birth is correct before submitting',
    metaDescription: 'Check the date of birth for your personal account is correct.',
    userName: personalDetails.info.userName ?? null,
    changeLink: PERSONAL_CHANGE_LINKS.personalDob(crn),
    dateOfBirth: presenters.formatLongDateFromParts(dob)
  }
}

export {
  personalDobCheckPresenter
}
