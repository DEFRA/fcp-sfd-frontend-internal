import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

/*
 * Formats data ready for presenting in the `/customer/{CRN}/account-phone-numbers-change` page
 * @module personalPhoneNumbersChangePresenter
 */

const personalPhoneNumbersChangePresenter = (personalDetails, payload, crn) => {
  return {
    backLink: crn ? `/customer/${crn}/details` : SEARCH_CRN,
    pageTitle: 'What are your personal phone numbers?',
    metaDescription: 'Update the phone numbers for your personal account.',
    userName: personalDetails.info.userName ?? null,
    personalTelephone: presenters.formatNumber(
      payload?.personalTelephone,
      personalDetails.changePersonalPhoneNumbers?.personalTelephone,
      personalDetails.contact.telephone
    ),
    personalMobile: presenters.formatNumber(
      payload?.personalMobile,
      personalDetails.changePersonalPhoneNumbers?.personalMobile,
      personalDetails.contact.mobile
    )
  }
}

export {
  personalPhoneNumbersChangePresenter
}
