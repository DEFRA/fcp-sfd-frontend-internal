/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix-list` page
 *
 * @module businessFixListPresenter
 */

import { presenters, constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix-list` page
 *
 * Each field shows the submitted payload if present, then any value already fixed earlier in the
 * journey, then the original business record.
 *
 * @param {object} data - The business data, including the ordered sections to fix and any pending changes held in the session
 * @param {object} [payload] - The form values submitted by the user, when the form is re-rendered after a validation failure
 * @param {string} sbi - The Single Business Identifier
 * @param {object} [errors] - The validation errors to display, if any
 *
 * @returns {object} The page data for the view
 */
const businessFixListPresenter = (data, payload, sbi, errors = null) => {
  const { BUSINESS_SECTION_FIELD_ORDER } = constants.interrupterJourney

  return {
    backLink: buildBackLink(sbi, data.source),
    pageTitle: 'Your business details to update',
    metaDescription: 'Your business details to update.',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    sections: data.orderedSectionsToFix,
    changeBusinessName: resolveFixValue(
      payload?.businessName,
      data.changeBusinessName?.businessName,
      data.businessName ?? null
    ),
    businessTelephone: presenters.formatNumber(
      payload?.businessTelephone,
      data.changeBusinessPhoneNumbers?.businessTelephone,
      data.landline
    ),
    businessMobile: presenters.formatNumber(
      payload?.businessMobile,
      data.changeBusinessPhoneNumbers?.businessMobile,
      data.mobile
    ),
    businessEmail: resolveFixValue(payload?.businessEmail, data.changeBusinessEmail?.businessEmail, data.email),
    address: formatAddress(payload, data.changeBusinessAddress),
    vatNumber: resolveFixValue(payload?.vatNumber, data.changeBusinessVat?.vatNumber, data.vat),
    errors: buildSortedErrors(errors, data.orderedSectionsToFix, BUSINESS_SECTION_FIELD_ORDER)
  }
}

/**
 * Builds the fix-list back link, omitting the source query string when it's missing.
 */
const buildBackLink = (sbi, source) => {
  if (!sbi) {
    return SEARCH_SBI
  }

  return source ? `/business/${sbi}/details/fix?source=${source}` : `/business/${sbi}/details/fix`
}

/**
 * Resolves the value to show for a fix-list field from the payload, session data or the original record.
 *
 * A payload means the user just submitted the form, so that value is shown to preserve their
 * input if validation failed. Otherwise, use data already fixed earlier in the journey, then
 * fall back to what's on the original record if neither of those exist yet.
 */
const resolveFixValue = (payloadValue, changedValue, originalValue) => {
  return payloadValue ?? changedValue ?? originalValue
}

const formatAddress = (payload, changeBusinessAddress) => {
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

  if (changeBusinessAddress) {
    return presenters.formatChangedAddress(changeBusinessAddress)
  }

  return null
}

const buildSortedErrors = (errors, orderedSectionsToFix, sectionFieldOrder) => {
  return errors
    ? presenters.sortErrorsBySectionOrder(errors, orderedSectionsToFix, sectionFieldOrder)
    : null
}

export {
  businessFixListPresenter
}
