/**
 * Formats data ready for presenting in the `/business/{sbi}/business-legal-status-enter` page
 * @module businessLegalStatusEnterPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const REGISTRATION_CONTENT = {
  charity: {
    hintText: 'This is 7 or 8 numbers, for example, 12345678.',
    pageTitle: 'Enter the charity commission registration number',
    metaDescription: 'Enter the Charity Commission registration number for this business.',
    field: 'charityCommissionRegistrationNumber'
  },
  company: {
    hintText: 'This is 8 characters, which may be either 8 numbers or 2 letters and 6 numbers. For example, 12345678 or SC123456.',
    pageTitle: 'Enter the company registration number',
    metaDescription: 'Enter the company registration number for this business.',
    field: 'companyRegistrationNumber'
  }
}

/**
 * Formats data for the `charity` or `company` variant of the `/business/{sbi}/business-legal-status-enter` page
 *
 * This single page is shared by two journeys, chosen by the legal status the user picked on the
 * change page: a Charity Commission registration number, or a Companies House registration number.
 * The returned page data is the same shape for both, just with different copy and field name, so the
 * view doesn't need to know which variant it's rendering.
 *
 * @param {object} data - Business details merged with any in-progress session changes
 * @param {object} [payload] - The submitted form payload, used to redisplay the entered value after a validation failure
 *
 * @returns {object} Page data for the view, including `field` (the form field name for this variant)
 */
const businessLegalStatusEnterPresenter = (data, payload) => {
  const sbi = data.info?.sbi
  const legalStatusCode = String(data.changeBusinessLegalStatus ?? data.info?.legalStatusCode ?? '')
  const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)

  // There are far more legal status codes that use the company registration number than the charity registration
  // number, so default to the company variant and if it is a charity override the content and session/fetched values
  // to the charity variant.
  let content = REGISTRATION_CONTENT.company
  let sessionValue = data.changeBusinessCompanyRegistrationNumber
  let fetchedValue = data.info?.registrationNumbers?.companiesHouse

  if (isCharity) {
    content = REGISTRATION_CONTENT.charity
    sessionValue = data.changeBusinessCharityCommissionRegistrationNumber
    fetchedValue = data.info?.registrationNumbers?.charityCommission
  }

  return {
    backLink: sbi ? `/business/${sbi}/business-legal-status-change` : SEARCH_SBI,
    pageTitle: content.pageTitle,
    metaDescription: content.metaDescription,
    businessName: data.info?.businessName ?? null,
    sbi: sbi ?? null,
    field: content.field,
    hintText: content.hintText,
    registrationNumber: payload?.[content.field] ?? sessionValue ?? fetchedValue ?? null
  }
}

export { businessLegalStatusEnterPresenter }
