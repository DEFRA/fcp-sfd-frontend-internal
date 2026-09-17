/**
 * Formats data ready for presenting in the `/business/{sbi}/address-select` page
 * @module businessAddressSelectPresenter
 */

import { constants, presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS: BUSINESS_CHANGE_LINKS } = constants.changeLinks.internal

const businessAddressSelectPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessAddress(sbi) : SEARCH_SBI,
    postcodeChangeLink: BUSINESS_CHANGE_LINKS.businessAddress(sbi),
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
