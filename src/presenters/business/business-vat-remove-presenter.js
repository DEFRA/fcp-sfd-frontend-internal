/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-remove` page
 *
 * @module businessVatRemovePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-remove` page
 *
 * @param {object} data - The business data, including the current VAT number
 * @param {string} [payload] - The confirmation value submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessVatRemovePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'Are you sure you want to remove your VAT registration number?',
    metaDescription: 'Are you sure you want to remove your VAT registration number?',
    businessName: data.businessName ?? null,
    confirmRemove: payload ?? null,
    vatNumber: data.vat ?? null,
    sbi: sbi ?? null
  }
}

export { businessVatRemovePresenter }
