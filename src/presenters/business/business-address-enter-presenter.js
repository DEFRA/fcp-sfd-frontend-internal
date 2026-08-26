/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-enter` page
 * @module businessAddressEnterPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessAddressEnterPresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/business-address-change` : SEARCH_SBI,
    pageTitle: 'Enter your business address',
    metaDescription: 'Enter the address for your business.',
    businessName: data.info?.businessName ?? null,
    sbi: sbi ?? null,
    address: formatAddress(payload, data.changeBusinessAddress, data.address)
  }
}

/**
 * Formats an address for display based on the available data.
 *
 * The function prioritises the input parameters in the following order:
 *
 * 1. If `payload` exists, it is returned as-is.
 *    This usually occurs when validation has failed and the form needs to be
 *    re-rendered with the user's submitted values.
 *
 * 2. If `changeBusinessAddress` exists:
 *    - If it contains a `uprn`, it indicates the address was selected from
 *      the postcode lookup. The lookup fields are mapped into the manual
 *      address structure used by the form.
 *
 *    - If no `uprn` is present, the address is assumed to have been manually
 *      entered and is returned as-is.
 *
 * 3. If `originalAddress` exists:
 *    - If `lookup.uprn` is present, the lookup address is mapped into the
 *      manual address structure used by the form.
 *    - Otherwise, the manual address lines are used.
 *
 * Returns `null` if no address data is available.
 */
const formatAddress = (payload, changeBusinessAddress, originalAddress) => {
  if (payload) {
    return payload
  }

  if (changeBusinessAddress) {
    return presenters.formatChangedAddress(changeBusinessAddress)
  }

  if (originalAddress) {
    return originalAddress.lookup?.uprn
      ? presenters.formatChangedAddress(originalAddress.lookup)
      : originalAddress.manual
  }

  return null
}

export {
  businessAddressEnterPresenter
}
