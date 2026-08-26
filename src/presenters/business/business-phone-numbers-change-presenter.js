/**
 * Formats data ready for presenting on the `/business/{sbi}/business-phone-numbers-change` page
 * @module businessPhoneNumbersChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const businessPhoneNumbersChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : '/search-sbi',
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
