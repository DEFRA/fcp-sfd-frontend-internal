/**
 * Formats data ready for presenting in the `/customer/{crn}/details/fix-list` page
 * @module personalFixListPresenter
 */

import { presenters, constants } from '@defra/fcp-sfd-frontend-engine'

const personalFixListPresenter = (personalDetails, payload, crn, errors = null) => {
  const { day, month, year } = formatDateOfBirth(personalDetails, payload)
  const { PERSONAL_SECTION_FIELD_ORDER } = constants.interrupterJourney

  const sortedErrors = errors
    ? presenters.sortErrorsBySectionOrder(errors, personalDetails.orderedSectionsToFix, PERSONAL_SECTION_FIELD_ORDER)
    : null

  return {
    backLink: crn ? `/customer/${crn}/details/fix?source=${personalDetails.source}` : '/search-crn',
    pageTitle: 'Your personal details to update',
    metaDescription: 'Your personal details to update.',
    sections: personalDetails.orderedSectionsToFix,
    name: formatName(payload, personalDetails),
    dateOfBirth: {
      day,
      month,
      year
    },
    personalTelephone: presenters.formatNumber(payload?.personalTelephone, personalDetails.changePersonalPhoneNumbers?.personalTelephone, personalDetails.contact.telephone),
    personalMobile: presenters.formatNumber(payload?.personalMobile, personalDetails.changePersonalPhoneNumbers?.personalMobile, personalDetails.contact.mobile),
    personalEmail: payload?.personalEmail ?? personalDetails.changePersonalEmail?.personalEmail ?? personalDetails.contact.email,
    address: formatAddress(payload, personalDetails.changePersonalAddress),
    errors: sortedErrors
  }
}

const formatName = (payload, personalDetails) => {
  return {
    first:
      payload?.first ??
      personalDetails.changePersonalName?.first ??
      personalDetails.info.fullName.first,
    middle:
      payload?.middle ??
      personalDetails.changePersonalName?.middle ??
      personalDetails.info.fullName.middle,
    last:
      payload?.last ??
      personalDetails.changePersonalName?.last ??
      personalDetails.info.fullName.last
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
