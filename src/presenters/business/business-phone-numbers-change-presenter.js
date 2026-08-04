/**
 * Formats data ready for presenting on the `/business/{sbi}/business-phone-numbers-change` page
 * @module businessPhoneNumbersChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'

const businessPhoneNumbersChangePresenter = (data, payload, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'What are your business phone numbers?',
    metaDescription: 'Update the phone numbers for your business.',
    userName: data.customer?.userName ?? null,
    businessName: data.info?.businessName ?? null,
    sbi: data.info?.sbi ?? null,
    businessTelephone: presenters.formatNumber(payload?.businessTelephone, data.changeBusinessPhoneNumbers?.businessTelephone, data.contact?.landline),
    businessMobile: presenters.formatNumber(payload?.businessMobile, data.changeBusinessPhoneNumbers?.businessMobile, data.contact?.mobile)
  }
}

export {
  businessPhoneNumbersChangePresenter
}
