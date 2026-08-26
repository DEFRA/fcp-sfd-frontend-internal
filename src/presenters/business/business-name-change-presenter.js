/**
 * Formats data ready for presenting in the `business-name-change` page
 * @module businessNameChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

const businessNameChangePresenter = (data, payload) => {
  const sbi = data.info?.sbi

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    changeBusinessName: payload ?? data.changeBusinessName ?? data.info?.businessName,
    businessName: data.info?.businessName ?? null,
    sbi: data.info?.sbi ?? null,
    userName: data.customer?.userName ?? null
  }
}

export { businessNameChangePresenter }
