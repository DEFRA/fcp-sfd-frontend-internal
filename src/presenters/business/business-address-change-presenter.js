/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-change` page
 * @module businessAddressChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessAddressChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    manualAddressLink: `/business/${sbi}/business-address-enter`,
    pageTitle: 'What is your business address?',
    metaDescription: 'Update the address for your business.',
    postcode: payload ?? data.changeBusinessPostcode?.postcode ?? data.address.postcode
  }
}

export {
  businessAddressChangePresenter
}
