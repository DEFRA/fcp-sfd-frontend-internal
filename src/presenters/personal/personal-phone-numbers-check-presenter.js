/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-phone-numbers-check` page
 * @module personalPhoneNumbersCheckPresenter
 */

import { SEARCH_CRN } from '../../constants/search-links.js'

const personalPhoneNumbersCheckPresenter = (data, crn) => {
  const phoneNumbers = data.changePersonalPhoneNumbers ?? {
    personalTelephone: data.contact.telephone,
    personalMobile: data.contact.mobile
  }

  return {
    backLink: crn ? `/customer/${crn}/account-phone-numbers-change` : SEARCH_CRN,
    changeLink: `/customer/${crn}/account-phone-numbers-change`,
    pageTitle: 'Check your personal phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your personal account are correct.',
    userName: data.info.userName ?? null,
    crn: crn ?? null,
    personalTelephone: {
      telephone: phoneNumbers.personalTelephone ?? null,
      mobile: phoneNumbers.personalMobile ?? null
    }
  }
}

export {
  personalPhoneNumbersCheckPresenter
}
