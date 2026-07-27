/**
 * Formats data ready for presenting in the `business-email-check` page
 * @module businessEmailCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessEmailCheckPresenter = (data, referrer) => {
  const fallbackHref = data.info?.sbi ? BUSINESS_CHANGE_LINKS.businessEmail(data.info.sbi) : '/search-sbi'

  const backLink = {
    backLink: true,
    href: resolveBackLink(referrer, fallbackHref)
  }

  const changeLink = BUSINESS_CHANGE_LINKS.businessEmail(data.info.sbi)

  return presenters.businessEmailCheck(data, backLink, changeLink)
}

export { businessEmailCheckPresenter }
