/**
 * Formats data ready for presenting in the `/business/{sbi}/address-change` page
 * @module businessAddressChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessAddressChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    manualAddressLink: `/business/${sbi}/address-enter`,
    pageTitle: 'What is your business address?',
    metaDescription: 'Update the address for your business.',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    postcode: payload ?? data.changeBusinessPostcode?.postcode ?? data.address.postcode
  }
}

export {
  businessAddressChangePresenter
}
