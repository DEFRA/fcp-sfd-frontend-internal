/**
 * Formats data ready for presenting on the `/business-vat-registration-number-check` page
 * @module businessVatCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessVatCheckPresenter = (data) => {
  const sbi = data.info?.sbi ?? null

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessVat(sbi) : '/search-sbi',
    changeLink: BUSINESS_CHANGE_LINKS.businessVat(data.info.sbi),
    pageTitle: 'Check your VAT registration number is correct before submitting',
    metaDescription: 'Check the VAT registration number for your business is correct.',
    vatNumber: data.changeBusinessVat ?? data.info.vat ?? null,
    sbi
  }
}

export { businessVatCheckPresenter }
