/**
 * Formats data ready for presenting in the `/account-address-select` page
 * @module personalAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const personalAddressSelectPresenter = (data) => {
  const crn = data.crn

  return {
    backLink: crn ? `/customer/${crn}/account-address-change` : '/search-crn',
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
