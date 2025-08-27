/**
 * Formats data ready for presenting in the `/business-VAT-registration-number-change` page
 * @module businessVatEnterPresenter
 */

const businessVatChangePresenter = (data, payload) => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your VAT registration number?',
    metaDescription: 'Update the VAT registration number for your business.',
    vatNumber: payload ?? data.vatNumber ?? data.info.vat ?? null,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    userName: data.customer.fullName ?? null
  }
}

export {
  businessVatChangePresenter
}
