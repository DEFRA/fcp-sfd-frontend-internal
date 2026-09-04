/**
 * Formats data ready for presenting in the `/customer/{crn}/details/fix-list` page
 * @module personalFixListPresenter
 */

import { presenters, constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const personalFixListPresenter = (data, payload, crn, errors = null) => {
  const { day, month, year } = formatDateOfBirth(data, payload)
  const { PERSONAL_SECTION_FIELD_ORDER } = constants.interrupterJourney

  const sortedErrors = errors
    ? presenters.sortErrorsBySectionOrder(errors, data.orderedSectionsToFix, PERSONAL_SECTION_FIELD_ORDER)
    : null

  return {
    backLink: crn ? `/customer/${crn}/details/fix?source=${data.source}` : SEARCH_CRN,
    pageTitle: 'Your personal details to update',
    metaDescription: 'Your personal details to update.',
    userName: data.info?.userName ?? null,
    crn: crn ?? null,
    sections: data.orderedSectionsToFix,
    name: formatName(payload, data),
    dateOfBirth: {
      day,
      month,
      year
    },
    personalTelephone: presenters.formatNumber(payload?.personalTelephone, data.changePersonalPhoneNumbers?.personalTelephone, data.contact.telephone),
    personalMobile: presenters.formatNumber(payload?.personalMobile, data.changePersonalPhoneNumbers?.personalMobile, data.contact.mobile),
    personalEmail: payload?.personalEmail ?? data.changePersonalEmail?.personalEmail ?? data.contact.email,
    address: formatAddress(payload, data.changePersonalAddress),
    errors: sortedErrors
  }
}

const formatName = (payload, data) => {
  return {
    first:
      payload?.first ??
      data.changePersonalName?.first ??
      data.info.fullName.first,
    middle:
      payload?.middle ??
      data.changePersonalName?.middle ??
      data.info.fullName.middle,
    last:
      payload?.last ??
      data.changePersonalName?.last ??
      data.info.fullName.last
  }
}

const formatAddress = (payload, changePersonalAddress) => {
  if (payload) {
    const {
      address1,
      address2,
      address3,
      city,
      county,
      postcode,
      country
    } = payload

    return { address1, address2, address3, city, county, postcode, country }
  }

  if (changePersonalAddress) {
    return presenters.formatChangedAddress(changePersonalAddress)
  }

  return null
}

/**
 * Builds date of birth values for the form inputs.
 *
 * Values coming from `payload` are always strings (they come from the form).
 * `changePersonalDob` is saved payload data, so these values are also strings.
 *
 * The original date of birth value comes from the DAL and isn't a string.
 * When falling back to those values we explicitly convert them to strings
 * so all sources are normalised and safe to use in inputs.
 *
 * Null values are handled to avoid showing 'null' in the UI.
 */
const formatDateOfBirth = (data, payload) => {
  if (payload) {
    return {
      day: payload.day ?? '',
      month: payload.month ?? '',
      year: payload.year ?? ''
    }
  }

  return {
    day: data.changePersonalDob?.day ?? data.info.dateOfBirth.day?.toString() ?? '',
    month: data.changePersonalDob?.month ?? data.info.dateOfBirth.month?.toString() ?? '',
    year: data.changePersonalDob?.year ?? data.info.dateOfBirth.year?.toString() ?? ''
  }
}

export {
  personalFixListPresenter
}
