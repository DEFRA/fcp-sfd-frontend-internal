/**
 * Formats data ready for presenting on the `/business-vat-registration-number-check` page
 * @module businessVatCheckPresenter
 */

import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessVatCheckPresenter = (data, referrer) => {
  const sbi = data.info?.sbi ?? null
  const fallbackHref = sbi ? BUSINESS_CHANGE_LINKS.businessVat(sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    changeLink: BUSINESS_CHANGE_LINKS.businessVat(data.info.sbi),
    pageTitle: 'Check your VAT registration number is correct before submitting',
    metaDescription: 'Check the VAT registration number for your business is correct.',
    vatNumber: data.changeBusinessVat ?? data.info.vat ?? null,
    sbi
  }
}

export { businessVatCheckPresenter }
