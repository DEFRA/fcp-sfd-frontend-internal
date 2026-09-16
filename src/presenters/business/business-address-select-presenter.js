/**
 * Formats data ready for presenting in the `/business/{sbi}/address-select` page
 * @module businessAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessAddressSelectPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/address-change` : SEARCH_SBI,
    postcodeChangeLink: `/business/${sbi}/address-change`,
    manualAddressLink: `/business/${sbi}/address-enter`,
    pageTitle: 'Choose your business address',
    metaDescription: 'Choose the address for your business.',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    postcode: data.changeBusinessPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changeBusinessAddresses ?? [], data.changeBusinessAddress)
  }
}

export {
  businessAddressSelectPresenter
}
