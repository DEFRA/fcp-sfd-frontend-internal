/**
 * Formats data ready for presenting on the `/business-vat-registration-number-change` page
 * @module businessVatChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessVatChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    businessName: data.info.businessName ?? null,
    vatNumber: payload ?? data.changeBusinessVat ?? data.info.vat,
    sbi: data.info.sbi ?? null
  }
}

export { businessVatChangePresenter }
