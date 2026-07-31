/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-enter` page
 * @module businessAddressEnterPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessAddressEnterPresenter = (data, payload, referrer) => {
  const sbi = data.info?.sbi
  const fallbackHref = sbi ? BUSINESS_CHANGE_LINKS.businessAddress(sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'Enter your business address',
    metaDescription: 'Enter the address for your business.',
    userName: data.customer?.userName ?? null,
    businessName: data.info.businessName ?? null,
    sbi,
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
 * 3. If `originalAddress` exists and contains a lookup address, it is mapped
 *    into the manual address structure used by the form.
 *
 * 4. Otherwise, return the address as provided.
 */
const formatAddress = (payload, changeBusinessAddress, address) => {
  if (payload) {
    return payload
  }

  if (changeBusinessAddress) {
    if (changeBusinessAddress.uprn) {
      return presenters.mapLookupAddressToManualAddressFormat(changeBusinessAddress)
    }

    return changeBusinessAddress
  }

  if (address?.lookup?.uprn) {
    return presenters.mapLookupAddressToManualAddressFormat(address.lookup)
  }

  return address
}

export {
  businessAddressEnterPresenter
}
