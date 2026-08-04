/**
 * Formats data ready for presenting on the `/business-phone-numbers-check` page
 * @module businessPhoneNumbersCheckPresenter
 */

import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessPhoneNumbersCheckPresenter = (data, referrer) => {
  const fallbackHref = data.info?.sbi ? BUSINESS_CHANGE_LINKS.businessTelephone(data.info.sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    changeLink: BUSINESS_CHANGE_LINKS.businessTelephone(data.info.sbi),
    pageTitle: 'Check your business phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your business are correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.info?.businessName ?? null,
    sbi: data.info?.sbi ?? null,
    businessMobile: data.changeBusinessPhoneNumbers?.businessMobile ?? null,
    businessTelephone: data.changeBusinessPhoneNumbers?.businessTelephone ?? null
  }
}

export { businessPhoneNumbersCheckPresenter }
