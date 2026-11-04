/**
 * Formats data ready for presenting in the `/customer/{crn}/account-phone-numbers-check` page
 *
 * @module personalPhoneNumbersCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-phone-numbers-check` page
 *
 * @param {object} data - The customer data, including any pending phone number change held in the session
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalPhoneNumbersCheckPresenter = (data, crn) => {
  const phoneNumbers = data.changePersonalPhoneNumbers ?? {
    personalTelephone: data.telephone,
    personalMobile: data.mobile
  }

  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalPhone(crn) : SEARCH_CRN,
    changeLink: PERSONAL_CHANGE_LINKS.personalPhone(crn),
    pageTitle: 'Check your personal phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your personal account are correct.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    personalTelephone: {
      telephone: phoneNumbers.personalTelephone ?? null,
      mobile: phoneNumbers.personalMobile ?? null
    }
  }
}

export {
  personalPhoneNumbersCheckPresenter
}
