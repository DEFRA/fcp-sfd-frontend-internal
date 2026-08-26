/**
 * Formats data ready for presenting in the `business-email-check` page
 * @module businessEmailCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessEmailCheckPresenter = (data) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessEmail(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessEmail(data.info.sbi),
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessEmail: data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessEmailCheckPresenter }
