/**
 * Formats data ready for presenting on the `/vat-registration-number-check` page
 * @module businessVatCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

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
