/**
 * Formats data ready for presenting on the `/business-vat-registration-remove` page
 * @module businessVatRemovePresenter
 */

const businessVatRemovePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : '/search-sbi',
    pageTitle: 'Are you sure you want to remove your VAT registration number?',
    metaDescription: 'Are you sure you want to remove your VAT registration number?',
    confirmRemove: payload ?? null,
    vatNumber: data.info?.vat ?? null,
    sbi: data.info?.sbi ?? null
  }
}

export { businessVatRemovePresenter }
