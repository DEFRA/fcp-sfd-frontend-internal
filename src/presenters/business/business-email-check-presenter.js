/**
 * Formats data ready for presenting in the `/business/{sbi}/email-check` page
 *
 * @module businessEmailCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS: BUSINESS_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/business/{sbi}/email-check` page
 *
 * @param {object} data - The business data, including any pending email change held in the session
 *
 * @returns {object} The page data for the view
 */
const businessEmailCheckPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessEmail(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessEmail(data.sbi),
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessEmail: data.changeBusinessEmail ?? data.email,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null
  }
}

export { businessEmailCheckPresenter }
