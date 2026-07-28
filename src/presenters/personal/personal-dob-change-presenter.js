/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-date-of-birth-change` page
 * @module personalDobChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const personalDobChangePresenter = (data, payload, crn) => {
  const { day, month, year } = presenters.formatDateInputValues(payload, data.changePersonalDob, data.info.dateOfBirth)

  return {
    backLink: { href: crn ? `/customer/${crn}/details` : '/search-crn' },
    pageTitle: 'What is your date of birth?',
    metaDescription: 'Update the date of birth for your personal account.',
    userName: data.info.userName ?? null,
    hint: 'For example, 31 3 1980',
    day,
    month,
    year
  }
}

export { personalDobChangePresenter }
