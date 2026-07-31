/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-select` page
 * @module businessAddressSelectPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessAddressSelectPresenter = (data, referrer) => {
  const sbi = data.info?.sbi
  const fallbackHref = sbi ? BUSINESS_CHANGE_LINKS.businessAddress(sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    postcodeChangeLink: sbi ? BUSINESS_CHANGE_LINKS.businessAddress(sbi) : '#',
    manualAddressLink: sbi ? `/business/${sbi}/business-address-enter` : '#',
    pageTitle: 'Choose your business address',
    metaDescription: 'Choose the address for your business.',
    userName: data.customer?.userName ?? null,
    businessName: data.info.businessName ?? null,
    sbi,
    postcode: data.changeBusinessPostcode?.postcode ?? null,
    displayAddresses: presenters.formatDisplayAddresses(data.changeBusinessAddresses ?? [], data.changeBusinessAddress)
  }
}

export {
  businessAddressSelectPresenter
}
