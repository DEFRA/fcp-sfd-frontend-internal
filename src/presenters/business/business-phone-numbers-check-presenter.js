/**
 * Formats data ready for presenting on the `/phone-numbers-check` page
 * @module businessPhoneNumbersCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessPhoneNumbersCheckPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessTelephone(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessTelephone(data.sbi),
    pageTitle: 'Check your business phone numbers are correct before submitting',
    metaDescription: 'Check the phone numbers for your business are correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    businessMobile: data.changeBusinessPhoneNumbers?.businessMobile ?? null,
    businessTelephone: data.changeBusinessPhoneNumbers?.businessTelephone ?? null
  }
}

export { businessPhoneNumbersCheckPresenter }
