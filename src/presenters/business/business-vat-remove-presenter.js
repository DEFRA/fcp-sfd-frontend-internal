/**
 * Formats data ready for presenting on the `/business-vat-registration-remove` page
 * @module businessVatRemovePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessVatRemovePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'Are you sure you want to remove your VAT registration number?',
    metaDescription: 'Are you sure you want to remove your VAT registration number?',
    businessName: data.info?.businessName ?? null,
    confirmRemove: payload ?? null,
    vatNumber: data.info?.vat ?? null,
    sbi: data.info?.sbi ?? null
  }
}

export { businessVatRemovePresenter }
