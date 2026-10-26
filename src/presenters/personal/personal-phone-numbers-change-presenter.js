/**
 * Formats data ready for presenting in the `/customer/{crn}/account-phone-numbers-change` page
 *
 * @module personalPhoneNumbersChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/customer/{crn}/account-phone-numbers-change` page
 *
 * Each number is, in order of preference, the submitted payload, the pending change held in the
 * session, or the current number from the DAL.
 *
 * @param {object} data - The customer data, including any pending phone number change held in the session
 * @param {object} [payload] - The phone numbers submitted by the user, when the form is re-rendered after a validation failure
 * @param {string} crn - The Customer Reference Number
 *
 * @returns {object} The page data for the view
 */
const personalPhoneNumbersChangePresenter = (data, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What are your personal phone numbers?',
    metaDescription: 'Update the phone numbers for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    personalTelephone: presenters.formatNumber(
      payload?.personalTelephone,
      data.changePersonalPhoneNumbers?.personalTelephone,
      data.telephone
    ),
    personalMobile: presenters.formatNumber(
      payload?.personalMobile,
      data.changePersonalPhoneNumbers?.personalMobile,
      data.mobile
    )
  }
}

export {
  personalPhoneNumbersChangePresenter
}
