/**
 * Formats data ready for presenting in the `/business/{sbi}/name-change` page
 *
 * @module businessNameChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/name-change` page
 *
 * @param {object} data - The business data, including any pending name change held in the session
 * @param {string} [payload] - The business name submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
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
