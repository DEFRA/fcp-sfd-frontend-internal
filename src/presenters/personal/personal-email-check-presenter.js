/**
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-email-check` page
 * @module personalEmailCheckPresenter
 */

const personalEmailCheckPresenter = (personalDetails, crn) => {
  return {
    backLink: { href: `/customer/${crn}/account-email-change` },
    changeLink: `/customer/${crn}/account-email-change`,
    pageTitle: 'Check your personal email address is correct before submitting',
    metaDescription: 'Check the email address for your personal account is correct.',
    userName: personalDetails.info.userName ?? null,
    personalEmail: personalDetails.changePersonalEmail ?? personalDetails.contact.email
  }
}

export {
  personalEmailCheckPresenter
}
