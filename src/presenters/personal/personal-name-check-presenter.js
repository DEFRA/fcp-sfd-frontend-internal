/**
 * Formats data ready for presenting in the `/customer/{crn}/account-name-check` page
 *
 * @module personalNameCheckPresenter
 */

import { constants, utils } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-name-check` page
 *
 * @param {object} data - The customer data, including any pending name change held in the session
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalNameCheckPresenter = (data, crn) => {
  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalName(crn) : SEARCH_CRN,
    changeLink: PERSONAL_CHANGE_LINKS.personalName(crn),
    pageTitle: 'Check your name is correct before submitting',
    metaDescription: 'Check the full name for your personal account is correct.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    fullName: utils.formatFullName(data.changePersonalName ?? data.fullName)
  }
}

export {
  personalNameCheckPresenter
}
