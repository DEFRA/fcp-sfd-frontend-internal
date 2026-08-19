/**
 * Formats data ready for presenting on the `/business-vat-registration-remove` page
 * @module businessVatRemovePresenter
 */

import { resolveBackLink } from '../base-presenter.js'

const businessVatRemovePresenter = (data, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'Are you sure you want to remove your VAT registration number?',
    metaDescription: 'Are you sure you want to remove your VAT registration number?',
    vatNumber: payload ?? data.changeBusinessVat ?? data.info.vat,
    sbi: data.info.sbi ?? null
  }
}

export { businessVatRemovePresenter }
