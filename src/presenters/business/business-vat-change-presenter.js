/**
 * Formats data ready for presenting on the `/business-vat-registration-number-change` page
 * @module businessVatChangePresenter
 */

import { resolveBackLink } from '../base-presenter.js'

const businessVatChangePresenter = (data, payload, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    vatNumber: payload ?? data.changeBusinessVat ?? data.info.vat,
    sbi: data.info.sbi ?? null
  }
}

export { businessVatChangePresenter }
