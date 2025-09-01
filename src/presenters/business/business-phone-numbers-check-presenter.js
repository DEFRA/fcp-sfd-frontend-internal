/**
 * Formats data ready for presenting in the `/business-phone-numbers-check` page
 * @module businessPhoneNumbersCheckPresenter
 */

const businessPhoneNumbersCheckPresenter = (businessDetails) => {
  return {
    backLink: { href: '/business-phone-numbers-change' },
    changeLink: '/business-phone-numbers-change',
    pageTitle: 'Check your business phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your business are correct.',
    businessName: businessDetails.info.businessName ?? null,
    sbi: businessDetails.info.sbi ?? null,
    userName: businessDetails.customer.fullName ?? null,
    businessMobile: businessDetails.changeBusinessMobile,
    businessTelephone: businessDetails.changeBusinessTelephone
  }
}

export {
  businessPhoneNumbersCheckPresenter
}
