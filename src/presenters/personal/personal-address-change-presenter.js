/**
 * Formats data ready for presenting in the `/account-address-change` page
 * @module personalAddressChangePresenter
 */

const personalAddressChangePresenter = (data, payload) => {
  const crn = data.crn

  return {
    backLink: crn ? `/customer/${crn}/details` : '/search-crn',
    manualAddressLink: `/customer/${crn}/account-address-enter`,
    pageTitle: 'What is your personal address?',
    metaDescription: 'Update the address for your personal account.',
    postcode: payload ?? data.changePersonalPostcode?.postcode ?? data.address.postcode
  }
}

export {
  personalAddressChangePresenter
}
