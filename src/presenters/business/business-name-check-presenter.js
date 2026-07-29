/**
 * Formats data ready for presenting in the `business-name-check` page
 * @module businessNameCheckPresenter
 */

import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessNameCheckPresenter = (data, referrer) => {
  const sbi = data.info?.sbi ?? null
  const fallbackHref = sbi ? BUSINESS_CHANGE_LINKS.businessName(sbi) : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    changeLink: fallbackHref,
    pageTitle: 'Check your business name is correct before submitting',
    metaDescription: 'Check the name for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessName: data.changeBusinessName ?? data.info?.businessName ?? null,
    sbi
  }
}

export { businessNameCheckPresenter }
