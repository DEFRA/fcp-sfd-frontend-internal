/**
 * Formats data ready for presenting in the `/account-address-change` page
 * @module personalAddressChangePresenter
 */

const personalAddressChangePresenter = (data, payload) => {
  return {
    backLink: { href: '/personal-details' },
    manualAddressLink: '/account-address-enter',
    pageTitle: 'What is your personal address?',
    metaDescription: 'Update the address for your personal account.',
    userName: data.info.userName ?? null,
    postcode: payload ?? data.changePersonalPostcode?.postcode ?? data.address.postcode
  }
}

export {
  personalAddressChangePresenter
}
