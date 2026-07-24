/*
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-email-change` page
 * @module personalEmailChangePresenter
 */

const personalEmailChangePresenter = (personalDetails, payload, crn) => {
  return {
    backLink: { href: crn ? `/customer/${crn}/details` : '/search-crn' },
    pageTitle: 'What is your personal email address?',
    metaDescription: 'Update the email address for your personal account.',
    userName: personalDetails.info.userName ?? null,
    personalEmail: payload ?? personalDetails.changePersonalEmail ?? personalDetails.contact.email
  }
}

export {
  personalEmailChangePresenter
}
