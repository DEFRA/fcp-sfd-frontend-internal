/**
 * Formats data ready for presenting in the `/business/{sbi}/business-address-change` page
 * @module businessAddressChangePresenter
 */

import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessAddressChangePresenter = (data, payload, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    manualAddressLink: data.info?.sbi ? `/business/${data.info.sbi}/business-address-enter` : '#',
    pageTitle: 'What is your business address?',
    metaDescription: 'Update the address for your business.',
    userName: data.customer?.userName ?? null,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    postcode: payload ?? data.changeBusinessPostcode?.postcode ?? data.address.postcode
  }
}

export {
  businessAddressChangePresenter
}
