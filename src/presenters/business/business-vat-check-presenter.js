/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-number-check` page
 *
 * @module businessVatCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS: BUSINESS_CHANGE_LINKS } = constants.changeLinks.internal

/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-number-check` page
 *
 * @param {object} data - The business data, including any pending VAT number change held in the session
 *
 * @returns {object} The page data for the view
 */
const businessVatCheckPresenter = (data) => {
  const sbi = data.sbi ?? null

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessVat(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessVat(data.sbi),
    pageTitle: 'Check your VAT registration number is correct before submitting',
    metaDescription: 'Check the VAT registration number for your business is correct.',
    businessName: data.businessName ?? null,
    vatNumber: data.changeBusinessVat ?? data.vat ?? null,
    sbi
  }
}

export { businessVatCheckPresenter }
