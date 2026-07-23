/**
 * Formats data ready for presenting in the `/business-email-check` page
 * @module businessEmailCheckPresenter
 */

import { resolveBackLink } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const businessEmailCheckPresenter = (data, referrer) => {
  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, BUSINESS_CHANGE_LINKS.businessEmail)
    },
    changeLink: BUSINESS_CHANGE_LINKS.businessEmail,
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessEmail: data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessEmailCheckPresenter }
