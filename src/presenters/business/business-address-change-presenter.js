/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-change` page
 * @module businessAddressChangePresenter
 */

const businessAddressChangePresenter = (data, payload) => {
  return {
    backLink: { href: `/business/${data.info?.sbi}/details` },
    manualAddressLink: `/business/${data.info?.sbi}/business-address-enter`,
    pageTitle: 'What is your business address?',
    metaDescription: 'Update the address for your business.',
    postcode: payload ?? data.changeBusinessPostcode?.postcode ?? data.address.postcode
  }
}

export {
  businessAddressChangePresenter
}
