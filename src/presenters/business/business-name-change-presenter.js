/**
 * Formats data ready for presenting in the `/business-name-change` page
 * @module businessNameChangePresenter
 */

const businessNameChangePresenter = (data, payload) => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    businessName: data.info.businessName ?? null,
    changeBusinessName: payload ?? data.changeBusinessName ?? data.info.businessName,
    sbi: data.info.sbi ?? null,
    userName: data.customer.fullName ?? null
  }
}

export {
  businessNameChangePresenter
}
