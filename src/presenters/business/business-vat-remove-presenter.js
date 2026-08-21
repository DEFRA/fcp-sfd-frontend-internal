/**
 * Formats data ready for presenting on the `/business-vat-registration-remove` page
 * @module businessVatRemovePresenter
 */

const businessVatRemovePresenter = (data, payload) => {
  return {
    backLink: {
      backLink: true,
      href: data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'
    },
    pageTitle: 'Are you sure you want to remove your VAT registration number?',
    metaDescription: 'Are you sure you want to remove your VAT registration number?',
    confirmRemove: payload ?? null,
    vatNumber: data.info?.vat ?? null,
    sbi: data.info?.sbi ?? null
  }
}

export { businessVatRemovePresenter }
