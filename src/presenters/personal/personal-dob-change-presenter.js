/**
 * Formats data ready for presenting in the `/customer/{crn}/account-date-of-birth-change` page
 *
 * @module personalDobChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-date-of-birth-change` page
 *
 * The date of birth shown is, in order of preference, the submitted payload, the pending change
 * held in the session, or the current date of birth.
 *
 * @param {object} data - The customer data, including any pending date of birth change held in the session
 * @param {object} [payload] - The date of birth submitted by the user, when the form is re-rendered after a validation failure
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalDobChangePresenter = (data, payload, crn) => {
  const { day, month, year } = presenters.formatDateInputValues(payload, data.changePersonalDob, data.dateOfBirth)

  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What is your date of birth?',
    metaDescription: 'Update the date of birth for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    hint: 'For example, 31 3 1980',
    day,
    month,
    year
  }
}

export { personalDobChangePresenter }
