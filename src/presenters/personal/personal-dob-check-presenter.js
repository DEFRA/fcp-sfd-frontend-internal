/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-date-of-birth-check` page
 * @module personalDobCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const personalDobCheckPresenter = (personalDetails, crn) => {
  const { day, month, year } = personalDetails.changePersonalDob ?? personalDetails.info.dateOfBirth
  // new Date() needs the format YYYY-MM-DD with leading zeros e.g. '1990-04-05' not '1990-4-5'
  const personalDob = new Date(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  )

  return {
    backLink: { href: `/customer/${crn}/account-date-of-birth-check` },
    pageTitle: 'Check your date of birth is correct before submitting',
    metaDescription: 'Check the date of birth for your personal account is correct.',
    userName: personalDetails.info.userName ?? null,
    changeLink: `/customer/${crn}/account-date-of-birth-change`,
    dateOfBirth: presenters.formatLongDate(personalDob)
  }
}

export {
  personalDobCheckPresenter
}
