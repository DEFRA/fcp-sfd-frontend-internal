/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-number-change` page
 *
 * @module businessVatChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-number-change` page
 *
 * @param {object} data - The business data, including any pending VAT number change held in the session
 * @param {string} [payload] - The VAT number submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessVatChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    businessName: data.businessName ?? null,
    vatNumber: payload ?? data.changeBusinessVat ?? data.vat,
    sbi: sbi ?? null
  }
}

export { businessVatChangePresenter }
