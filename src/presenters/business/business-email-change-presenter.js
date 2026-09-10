/**
 * Formats data ready for presenting in the `email-change` page
 * @module businessEmailChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessEmailChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    userName: data.customer?.userName ?? null,
    businessEmail: payload ?? data.changeBusinessEmail ?? data.email,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null
  }
}

export { businessEmailChangePresenter }
