/**
 * Formats data ready for presenting in the `business-email-change` page
 * @module businessEmailChangePresenter
 */

const businessEmailChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : '/search-sbi',
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    userName: data.customer?.userName ?? null,
    businessEmail: payload ?? data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessEmailChangePresenter }
