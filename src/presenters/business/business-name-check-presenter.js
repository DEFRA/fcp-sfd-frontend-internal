/**
 * Formats data ready for presenting in the `name-check` page
 * @module businessNameCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS: BUSINESS_CHANGE_LINKS } = constants.changeLinks.internal

const businessNameCheckPresenter = (data) => {
  const sbi = data.sbi ?? null
  const changeLink = sbi ? BUSINESS_CHANGE_LINKS.businessName(sbi) : SEARCH_SBI

  return {
    backLink: changeLink,
    changeLink,
    pageTitle: 'Check your business name is correct before submitting',
    metaDescription: 'Check the name for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.businessName ?? null,
    changeBusinessName: data.changeBusinessName ?? data.businessName ?? null,
    sbi
  }
}

export { businessNameCheckPresenter }
