/**
 * Formats data ready for presenting in the `/account-address-select` page
 * @module personalAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const personalAddressSelectPresenter = (data) => {
  return {
    backLink: { href: `/customer/${data.crn}/account-address-change` },
    postcodeChangeLink: `/customer/${data.crn}/account-address-change`,
    manualAddressLink: `/customer/${data.crn}/account-address-enter`,
    pageTitle: 'Choose your personal address',
    metaDescription: 'Choose the address for your personal account.',
    postcode: data.changePersonalPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changePersonalAddresses ?? [], data.changePersonalAddress)
  }
}

export {
  personalAddressSelectPresenter
}
