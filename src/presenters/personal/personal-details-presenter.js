/**
 * Formats data ready for presenting in the personal details page '/customer/{crn}/details'.
 * @module personalDetailsPresenter
 */

import moment from 'moment'
import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { config } from '../../config/index.js'

const personalDetailsPresenter = (data, yar, hasValidPersonalDetails, sectionsNeedingUpdate) => {
  const changeLinks = formatChangeLinks(data.crn, hasValidPersonalDetails, sectionsNeedingUpdate)
  const { action: dobAction, formattedDob } = formatDob(data.info.dateOfBirth.full)

  return {
    breadcrumbs: buildBreadcrumbs(data),
    notification: yar ? yar.flash('notification')[0] : null,
    pageTitle: 'View and update your personal details',
    metaDescription: 'View and update your personal details.',
    userName: data.info.userName ?? null,
    crn: data.crn,
    personalName: {
      fullName: data.info.fullNameJoined,
      action: getActionText(data.info.fullNameJoined),
      changeLink: changeLinks.name
    },
    dob: {
      fullDateOfBirth: formattedDob,
      action: dobAction,
      changeLink: changeLinks.dob
    },
    personalAddress: {
      address: formatAddress(data.address),
      action: getActionText(data.address?.lookup?.uprn || data.address?.manual?.line1),
      changeLink: changeLinks.address
    },
    personalTelephone: {
      telephone: data.contact.telephone || 'Not added',
      mobile: data.contact.mobile || 'Not added',
      action: getActionText(data.contact.telephone || data.contact.mobile),
      changeLink: changeLinks.phone
    },
    personalEmail: {
      email: data.contact.email || 'Not added',
      action: getActionText(data.contact.email),
      changeLink: changeLinks.email
    }
  }
}

const formatAddress = (personalAddress) => {
  let addressText = 'Not added'

  if (personalAddress.lookup?.uprn || personalAddress.manual?.line1) {
    addressText = presenters.formatDisplayAddress(personalAddress)
  }

  return addressText
}

const getActionText = (value) => {
  return value ? 'Change' : 'Add'
}

/**
 * Builds change links for personal details based on whether the
 * personal details interrupter is enabled and the validity of the data.
 *
 * When the interrupter is disabled or all personal details are valid,
 * standard change links are returned.
 *
 * When the interrupter is enabled and details are invalid:
 * - If only one section needs updating, its normal change link is used
 * - Otherwise, all links point to the personal details fix journey
 */
const formatChangeLinks = (crn, hasValidPersonalDetails, sectionsNeedingUpdate = []) => {
  const CHANGE_LINKS = {
    name: `/customer/${crn}/account-name-change`,
    address: `/customer/${crn}/account-address-change`,
    phone: `/customer/${crn}/account-phone-numbers-change`,
    email: `/customer/${crn}/account-email-change`,
    dob: `/customer/${crn}/account-date-of-birth-change`
  }

  const personalDetailsInterrupterEnabled = config.get('featureToggle.personalDetailsInterrupterEnabled')

  // Happy path – interrupter off or data is valid
  if (!personalDetailsInterrupterEnabled || hasValidPersonalDetails || sectionsNeedingUpdate.length === 0) {
    return CHANGE_LINKS
  }

  // Interrupter on and data invalid
  const singleSection = sectionsNeedingUpdate.length === 1 ? sectionsNeedingUpdate[0] : null

  return {
    name: singleSection === 'name' ? CHANGE_LINKS.name : '/personal-fix?source=name',
    address: singleSection === 'address' ? CHANGE_LINKS.address : '/personal-fix?source=address',
    phone: singleSection === 'phone' ? CHANGE_LINKS.phone : '/personal-fix?source=phone',
    email: singleSection === 'email' ? CHANGE_LINKS.email : '/personal-fix?source=email',
    dob: singleSection === 'dob' ? CHANGE_LINKS.dob : '/personal-fix?source=dob'
  }
}

const formatDob = (dob) => {
  if (!dob) {
    return { formattedDob: 'Not added', action: 'Add' }
  }

  const dobMoment = moment(dob)

  if (!dobMoment.isValid() || dobMoment.isAfter(moment(), 'day')) {
    return { formattedDob: 'Not added', action: 'Add' }
  }

  return {
    formattedDob: dobMoment.format('D MMMM YYYY'),
    action: 'Change'
  }
}

const buildBreadcrumbs = (data) => {
  // Defensively build breadcrumbs - show second breadcrumb only if both fullNameJoined and CRN exist
  const breadcrumbs = [
    {
      text: 'Search results',
      href: '/search-crn'
    }
  ]

  if (data.info?.userName && data.crn) {
    breadcrumbs.push({
      text: `${data.info.userName} (CRN: ${data.crn})`,
      href: `/customer/${data.crn}`
    })
  }

  return breadcrumbs
}

export {
  personalDetailsPresenter
}
