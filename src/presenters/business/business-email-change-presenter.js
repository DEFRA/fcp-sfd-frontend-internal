/**
 * Formats data ready for presenting in the `/business/{sbi}/email-change` page
 *
 * @module businessEmailChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/email-change` page
 *
 * @param {object} data - The business data, including any pending email change held in the session
 * @param {string} [payload] - The email address submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessEmailChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    userName: data.customer?.userName ?? null,
    businessEmail: payload ?? data.changeBusinessEmail ?? data.email,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null
  }
}

export { businessEmailChangePresenter }
