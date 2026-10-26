/**
 * Formats data ready for presenting in the `/business/{sbi}/phone-numbers-change` page
 *
 * @module businessPhoneNumbersChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/phone-numbers-change` page
 *
 * Each number is, in order of preference, the submitted payload, the pending change held in the
 * session, or the current number from the DAL.
 *
 * @param {object} data - The business data, including any pending phone number change held in the session
 * @param {object} [payload] - The phone numbers submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessPhoneNumbersChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What are your business phone numbers?',
    metaDescription: 'Update the phone numbers for your business.',
    userName: data.customer?.userName ?? null,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    businessTelephone: presenters.formatNumber(payload?.businessTelephone, data.changeBusinessPhoneNumbers?.businessTelephone, data.landline),
    businessMobile: presenters.formatNumber(payload?.businessMobile, data.changeBusinessPhoneNumbers?.businessMobile, data.mobile)
  }
}

export {
  businessPhoneNumbersChangePresenter
}
