/**
* Formats data ready for presenting in the `/business-email-change` page
* @module businessEmailEnterPresenter
*/

import { resolveBackLink } from '../base-presenter.js'

const businessEmailChangePresenter = (data, payload, referrer) => {
  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, `/business/${data.info.sbi}/details`)
    },
    pageTitle: 'What is your business email address?',
    metaDescription: 'Update the email address for your business.',
    userName: data.customer?.userName ?? null,
    businessEmail: payload ?? data.changeBusinessEmail ?? data.contact.email,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null
  }
}

export { businessEmailChangePresenter }
