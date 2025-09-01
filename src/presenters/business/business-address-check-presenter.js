/**
 * Formats data ready for presenting in the `/business-address-check` page
 * @module businessAddressCheckPresenter
 */

const businessAddressCheckPresenter = (businessDetails) => {
  return {
    backLink: { href: '/business-address-enter' },
    changeLink: '/business-address-enter',
    pageTitle: 'Check your business address is correct before submitting',
    metaDescription: 'Check the address for your business is correct.',
    address: formatAddress(businessDetails.changeBusinessAddress ?? businessDetails.address),
    businessName: businessDetails.info.businessName ?? null,
    sbi: businessDetails.info.sbi ?? null,
    userName: businessDetails.customer.fullName ?? null
  }
}

/**
 * Formats the business address by removing any falsy values (e.g. empty strings, null, undefined)
 * @private
 */
const formatAddress = (businessAddress) => {
  return Object.values(businessAddress).filter(Boolean)
}

export {
  businessAddressCheckPresenter
}
