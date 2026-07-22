/**
 * Formats data ready for presenting in the `/business-email-check` page
 * @module businessEmailCheckPresenter
 */

import { resolveBackLink } from '../base-presenter.js'

const businessEmailCheckPresenter = (data, referrer) => {
  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, '/business-email-change')
    },
    changeLink: '/business-email-change',
    pageTitle: 'Check your business email address is correct before submitting',
    metaDescription: 'Check the email address for your business is correct.',
    userName: data.customer?.userName ?? null,
    businessEmail: data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessEmailCheckPresenter }
