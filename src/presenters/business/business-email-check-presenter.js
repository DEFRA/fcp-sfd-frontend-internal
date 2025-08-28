/**
 * Formats data ready for presenting in the `/business-email-check` page
 * @module businessEmailCheckPresenter
 */

const businessEmailCheckPresenter = (data) => {
  return {
    backLink: { href: '/business-email-change' },
    changeLink: '/business-email-change',
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    businessEmail: data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    userName: data.customer.fullName ?? null
  }
}

export {
  businessEmailCheckPresenter
}
