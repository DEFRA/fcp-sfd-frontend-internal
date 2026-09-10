/**
 * Formats data ready for presenting on the `/vat-registration-number-change` page
 * @module businessVatChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

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
