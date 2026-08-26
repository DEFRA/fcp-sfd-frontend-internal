/**
 * Formats data ready for presenting in the `/account-address-select` page
 * @module personalAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const personalAddressSelectPresenter = (data) => {
  const crn = data.crn

  return {
    backLink: crn ? `/customer/${crn}/account-address-change` : SEARCH_CRN,
    postcodeChangeLink: `/customer/${crn}/account-address-change`,
    manualAddressLink: `/customer/${crn}/account-address-enter`,
    pageTitle: 'Choose your personal address',
    metaDescription: 'Choose the address for your personal account.',
    postcode: data.changePersonalPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changePersonalAddresses ?? [], data.changePersonalAddress)
  }
}

export {
  personalAddressSelectPresenter
}
