/**
 * Formats data ready for presenting in the `/account-address-change` page
 * @module personalAddressChangePresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

const personalAddressChangePresenter = (data, payload) => {
  const crn = data.crn

  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    manualAddressLink: `/customer/${crn}/account-address-enter`,
    pageTitle: 'What is your personal address?',
    metaDescription: 'Update the address for your personal account.',
    userName: data.info?.userName ?? null,
    crn: crn ?? null,
    postcode: payload ?? data.changePersonalPostcode?.postcode ?? data.address.postcode
  }
}

export {
  personalAddressChangePresenter
}
