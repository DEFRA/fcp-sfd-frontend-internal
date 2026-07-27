/**
 * Formats data ready for presenting in the `business-email-change` page
 * @module businessEmailChangePresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { resolveBackLink } from '../base-presenter.js'

const businessEmailChangePresenter = (data, payload, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  const backLink = {
    backLink: true,
    href: resolveBackLink(referrer, fallbackHref)
  }

  return presenters.businessEmailChange(data, payload, backLink)
}

export { businessEmailChangePresenter }
