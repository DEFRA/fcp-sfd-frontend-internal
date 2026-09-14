/**
 * Formats data ready for presenting in the `email-check` page
 * @module businessEmailCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessEmailCheckPresenter = (data) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? BUSINESS_CHANGE_LINKS.businessEmail(sbi) : SEARCH_SBI,
    changeLink: BUSINESS_CHANGE_LINKS.businessEmail(data.sbi),
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessEmail: data.changeBusinessEmail ?? data.email,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null
  }
}

export { businessEmailCheckPresenter }
