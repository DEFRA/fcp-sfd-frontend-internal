/*
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-name-change` page
 * @module personalNameChangePresenter
 */

const personalNameChangePresenter = (data, payload, crn) => {
  return {
    backLink: { href: `/customer/${crn}/details` },
    pageTitle: 'What is your full name?',
    metaDescription: 'Update the full name for your personal account.',
    userName: data.info.userName ?? null,
    first: payload?.first ?? data.changePersonalName?.first ?? data.info.fullName.first,
    middle: payload?.middle ?? data.changePersonalName?.middle ?? data.info.fullName.middle,
    last: payload?.last ?? data.changePersonalName?.last ?? data.info.fullName.last
  }
}

export {
  personalNameChangePresenter
}
