/**
 * Formats data ready for presenting in the `/business-email-change` page
 * @module businessEmailEnterPresenter
 */

const businessEmailChangePresenter = (data, payload) => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    businessEmail: payload ?? data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    userName: data.customer.fullName ?? null
  }
}

export {
  businessEmailChangePresenter
}
