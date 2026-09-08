/**
 * Formats data ready for presenting in the `/account-address-check` page
 * @module personalAddressCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const personalAddressCheckPresenter = (data) => {
  const { changePersonalAddress, address, crn, info } = data

  // Determine the appropriate address page based on how the address was entered.
  // Postcode lookup uses the select page, manual entry uses the enter page.
  const addressPage = changePersonalAddress?.postcodeLookup ? 'account-address-select' : 'account-address-enter'

  return {
    backLink: crn ? `/customer/${crn}/${addressPage}` : SEARCH_CRN,
    changeLink: `/customer/${crn}/${addressPage}`,
    pageTitle: 'Check your personal address is correct before submitting',
    metaDescription: 'Check the address for your personal account is correct.',
    userName: info?.userName ?? null,
    crn: crn ?? null,
    address: formatAddress(changePersonalAddress, address)
  }
}
/**
 * Formats the personal address into an array of address parts.
 *
 * When the user has a pending change in the session (`changePersonalAddress`) that flat
 * address is used, removing falsy values and, for postcode lookup selections, the `uprn`,
 * `displayAddress` and `postcodeLookup` keys.
 *
 * When there is no pending change, the address falls back to the personal address mapped
 * from the DAL. This has a nested `{ lookup, manual, ... }` shape, so it is formatted with
 * the shared `formatDisplayAddress` helper.
 */
const formatAddress = (changePersonalAddress, address) => {
  if (!changePersonalAddress) {
    return presenters.formatDisplayAddress(address)
  }

  if (changePersonalAddress.postcodeLookup) {
    const { uprn, displayAddress, postcodeLookup, ...addressParts } = changePersonalAddress

    return Object.values(addressParts).filter(Boolean)
  }

  return Object.values(changePersonalAddress).filter(Boolean)
}

export {
  personalAddressCheckPresenter
}
