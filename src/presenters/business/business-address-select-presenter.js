/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-select` page
 * @module businessAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const businessAddressSelectPresenter = (data) => {
  return {
    backLink: { href: `/business/${data.info?.sbi}/business-address-change` },
    postcodeChangeLink: `/business/${data.info?.sbi}/business-address-change`,
    manualAddressLink: `/business/${data.info?.sbi}/business-address-enter`,
    pageTitle: 'Choose your business address',
    metaDescription: 'Choose the address for your business.',
    postcode: data.changeBusinessPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changeBusinessAddresses ?? [], data.changeBusinessAddress)
  }
}

export {
  businessAddressSelectPresenter
}
