/**
 * Formats data ready for presenting in the `/personal-details` page
 * @module personalDetailsPresenter
 */

import { addressPresenter } from '../address-presenter.js'

const personalDetailsPresenter = (data, yar) => {
  return {
    backLink: { href: '/home' },
    notification: yar ? yar.flash('notification')[0] : null,
    pageTitle: 'View and update your personal details',
    metaDescription: 'View and update your personal details.',
    crn: data.crn,
    address: addressPresenter.formatAddress(data.address),
    fullName: formatFullName(data.info.fullName),
    personalTelephone: data.contact.telephone ?? 'Not added',
    personalMobile: data.contact.mobile ?? 'Not added',
    personalEmail: data.contact.email,
    dateOfBirth: data.info.dateOfBirth
  }
}

const formatFullName = (fullName) => {
  const { first, middle, last } = fullName

  return `${first} ${middle ? middle + ' ' : ''}${last}`
}

export {
  personalDetailsPresenter
}
