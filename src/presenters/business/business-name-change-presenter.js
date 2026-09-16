/**
 * Formats data ready for presenting in the `name-change` page
 * @module businessNameChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessNameChangePresenter = (data, payload) => {
  const sbi = data.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    changeBusinessName: payload ?? data.changeBusinessName ?? data.businessName,
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    userName: data.customer?.userName ?? null
  }
}

export { businessNameChangePresenter }
