/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-check` page
 * @module businessAddressCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessAddressCheckPresenter = (businessDetails) => {
  const { changeBusinessAddress, address, info } = businessDetails
  const sbi = info?.sbi

  // Determine the appropriate address page based on how the address was entered.
  // Postcode lookup uses the select page, manual entry uses the enter page.
  const addressPage = changeBusinessAddress?.postcodeLookup ? 'business-address-select' : 'business-address-enter'

  return {
    backLink: sbi ? `/business/${sbi}/${addressPage}` : SEARCH_SBI,
    changeLink: `/business/${sbi}/${addressPage}`,
    pageTitle: 'Check your business address is correct before submitting',
    metaDescription: 'Check the address for your business is correct.',
    address: formatAddress(changeBusinessAddress, address)
  }
}

/**
 * Formats the business address into an array of address parts.
 *
 * When the user has a pending change in the session (`changeBusinessAddress`) that flat
 * address is used, removing falsy values and, for postcode lookup selections, the `uprn`,
 * `displayAddress` and `postcodeLookup` keys.
 *
 * When there is no pending change, the address falls back to the business address mapped
 * from the DAL. This has a nested `{ lookup, manual, ... }` shape, so it is formatted with
 * the shared `formatDisplayAddress` helper.
 */
const formatAddress = (changeBusinessAddress, address) => {
  if (!changeBusinessAddress) {
    return presenters.formatDisplayAddress(address)
  }

  if (changeBusinessAddress.postcodeLookup) {
    const { uprn, displayAddress, postcodeLookup, ...addressParts } = changeBusinessAddress

    return Object.values(addressParts).filter(Boolean)
  }

  return Object.values(changeBusinessAddress).filter(Boolean)
}

export {
  businessAddressCheckPresenter
}
