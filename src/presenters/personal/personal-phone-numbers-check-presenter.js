/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-phone-numbers-check` page
 * @module personalPhoneNumbersCheckPresenter
 */

const personalPhoneNumbersCheckPresenter = (personalDetails, crn) => {
  // Fall back to the saved phone numbers when there is no pending change in the session (for
  // example when the user reaches this page via the browser back button after submitting).
  const phoneNumbers = personalDetails.changePersonalPhoneNumbers ?? {
    personalTelephone: personalDetails.contact.telephone,
    personalMobile: personalDetails.contact.mobile
  }

  return {
    backLink: { href: `/customer/${crn}/account-phone-numbers-change` },
    changeLink: `/customer/${crn}/account-phone-numbers-change`,
    pageTitle: 'Check your personal phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your personal account are correct.',
    userName: personalDetails.info.userName ?? null,
    personalTelephone: {
      telephone: phoneNumbers.personalTelephone ?? null,
      mobile: phoneNumbers.personalMobile ?? null
    }
  }
}

export {
  personalPhoneNumbersCheckPresenter
}
