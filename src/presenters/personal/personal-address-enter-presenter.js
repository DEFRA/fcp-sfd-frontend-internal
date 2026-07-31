/**
 * Formats data ready for presenting in the `/account-address-enter` page
 * @module personalAddressEnterPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const personalAddressEnterPresenter = (data, payload) => {
  return {
    backLink: { href: '/account-address-change' },
    pageTitle: 'Enter your personal address',
    metaDescription: 'Enter the address for your personal account.',
    userName: data.info.userName ?? null,
    address: formatAddress(payload, data.changePersonalAddress, data.address)
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
 * 2. If `changePersonalAddress` exists:
 *    - If it contains a `uprn`, it indicates the address was selected from
 *      the postcode lookup. The lookup fields are mapped into the manual
 *      address structure used by the form:
 *        - `address1` → `pafOrganisationName`, `flatName`, `buildingName`
 *        - `address2` → `buildingNumberRange` + `street`
 *        - `address3` → `doubleDependentLocality`, `dependentLocality`
 *
 *    - If no `uprn` is present, the address is assumed to have been manually
 *      entered and is returned as-is.
 *
 * 3. If `originalAddress` exists:
 *    - If `lookup.uprn` is present, the lookup address is mapped into the
 *      manual address structure used by the form.
 *    - Otherwise, the manual address lines (`line1`–`line5`) are used.
 *
 * Returns `null` if no address data is available.
 */
const formatAddress = (payload, changePersonalAddress, originalAddress) => {
  if (payload) {
    return payload
  }

  if (changePersonalAddress) {
    return presenters.formatChangedAddress(changePersonalAddress)
  }

  if (originalAddress) {
    return presenters.formatOriginalAddress(originalAddress)
  }

  return null
}

export {
  personalAddressEnterPresenter
}
