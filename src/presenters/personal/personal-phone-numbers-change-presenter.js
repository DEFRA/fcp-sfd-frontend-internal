import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

/*
 * Formats data ready for presenting in the `/customer/{CRN}/account-phone-numbers-change` page
 * @module personalPhoneNumbersChangePresenter
 */

const personalPhoneNumbersChangePresenter = (data, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What are your personal phone numbers?',
    metaDescription: 'Update the phone numbers for your personal account.',
    userName: data.info.userName ?? null,
    crn: crn ?? null,
    personalTelephone: presenters.formatNumber(
      payload?.personalTelephone,
      data.changePersonalPhoneNumbers?.personalTelephone,
      data.contact.telephone
    ),
    personalMobile: presenters.formatNumber(
      payload?.personalMobile,
      data.changePersonalPhoneNumbers?.personalMobile,
      data.contact.mobile
    )
  }
}

export {
  personalPhoneNumbersChangePresenter
}
