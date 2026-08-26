/**
 * Formats data ready for presenting on the `/business-vat-registration-number-change` page
 * @module businessVatChangePresenter
 */

const businessVatChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : '/search-sbi',
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    vatNumber: payload ?? data.changeBusinessVat ?? data.info.vat,
    sbi: data.info.sbi ?? null
  }
}

export { businessVatChangePresenter }
