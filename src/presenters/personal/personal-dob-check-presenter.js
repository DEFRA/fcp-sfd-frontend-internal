/**
 * Formats data ready for presenting in the `/customer/{crn}/account-date-of-birth-check` page
 *
 * @module personalDobCheckPresenter
 */

import { constants, presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-date-of-birth-check` page
 *
 * @param {object} data - The customer data, including any pending date of birth change held in the session
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalDobCheckPresenter = (data, crn) => {
  const { day, month, year } = data.changePersonalDob ?? data.dateOfBirth
  // new Date() needs the format YYYY-MM-DD with leading zeros e.g. '1990-04-05' not '1990-4-5'
  const personalDob = new Date(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  )

  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalDateOfBirth(crn) : SEARCH_CRN,
    pageTitle: 'Check your date of birth is correct before submitting',
    metaDescription: 'Check the date of birth for your personal account is correct.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    changeLink: PERSONAL_CHANGE_LINKS.personalDateOfBirth(crn),
    dateOfBirth: presenters.formatLongDate(personalDob)
  }
}

export {
  personalDobCheckPresenter
}
