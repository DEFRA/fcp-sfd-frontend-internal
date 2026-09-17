/**
 * Formats data ready for presenting in the `/account-address-select` page
 * @module personalAddressSelectPresenter
 */

import { constants, presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

const personalAddressSelectPresenter = (data) => {
  const crn = data.crn

  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalAddress(crn) : SEARCH_CRN,
    postcodeChangeLink: PERSONAL_CHANGE_LINKS.personalAddress(crn),
    manualAddressLink: `/customer/${crn}/account-address-enter`,
    pageTitle: 'Choose your personal address',
    metaDescription: 'Choose the address for your personal account.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    postcode: data.changePersonalPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changePersonalAddresses ?? [], data.changePersonalAddress)
  }
}

export {
  personalAddressSelectPresenter
}
