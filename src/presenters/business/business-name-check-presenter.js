/**
 * Formats data ready for presenting in the `business-name-check` page
 * @module businessNameCheckPresenter
 */

import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessNameCheckPresenter = (data) => {
  const sbi = data.info?.sbi ?? null
  const changeLink = sbi ? BUSINESS_CHANGE_LINKS.businessName(sbi) : '/search-sbi'

  return {
    backLink: changeLink,
    changeLink,
    pageTitle: 'Check your business name is correct before submitting',
    metaDescription: 'Check the name for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.changeBusinessName ?? data.info?.businessName ?? null,
    sbi
  }
}

export { businessNameCheckPresenter }
