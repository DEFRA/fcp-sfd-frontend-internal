/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-check` page
 * @module businessAddressCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessAddressCheckPresenter = (data, referrer) => {
  const fallbackHref = data.info?.sbi ? BUSINESS_CHANGE_LINKS.businessAddress(data.info.sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    changeLink: BUSINESS_CHANGE_LINKS.businessAddress(data.info.sbi),
    pageTitle: 'Check your business address is correct before submitting',
    metaDescription: 'Check the address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    address: formatAddress(data.changeBusinessAddress, data.address)
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
