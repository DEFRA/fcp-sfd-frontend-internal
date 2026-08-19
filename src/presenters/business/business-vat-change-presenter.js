/**
 * Formats data ready for presenting on the `/business-vat-registration-number-change` page
 * @module businessVatChangePresenter
 */

import { resolveBackLink } from '../base-presenter.js'

const businessVatChangePresenter = (data, payload, referrer) => {
  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    userName: data.customer?.userName ?? null,
    vatNumber: payload ?? data.changeBusinessVat ?? data.info.vat,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessVatChangePresenter }
