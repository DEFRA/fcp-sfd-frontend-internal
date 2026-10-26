/**
 * Formats data ready for presenting in the `/business/{sbi}/phone-numbers-check` page
 *
 * @module businessPhoneNumbersCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS: BUSINESS_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/business/{sbi}/phone-numbers-check` page
 *
 * @param {object} data - The business data, including any pending phone number change held in the session
 *
 * @returns {object} The page data for the view
 */
const businessPhoneNumbersCheckPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessPhone(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessPhone(data.sbi),
    pageTitle: 'Check your business phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your business are correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    businessMobile: data.changeBusinessPhoneNumbers?.businessMobile ?? null,
    businessTelephone: data.changeBusinessPhoneNumbers?.businessTelephone ?? null
  }
}

export { businessPhoneNumbersCheckPresenter }
