/**
 * Validates a business registration number submitted on the `/business/{sbi}/business-legal-status-enter` page
 * @module validateBusinessRegistrationNumberService
 */

import { constants, schemas } from '@defra/fcp-sfd-frontend-engine'

/**
 * Charity Commission and Companies House numbers have different formats, so this works out which one applies
 * for the selected legal status, validates the payload against the matching schema, and returns the session
 * key the result should be stored under.
 *
 * @param {string|number} legalStatusCode - The legal status code selected on the change page
 * @param {object} payload - The submitted form payload
 *
 * @returns {object} `{ error, value, payloadField, sessionField }` - `error` and `value` are Joi's validation
 * result, `payloadField` is the form field name and `sessionField` is where the value should be stored in session
 */
const validateBusinessRegistrationNumberService = (legalStatusCode, payload) => {
  const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(String(legalStatusCode))

  // Default to the company variant, then override with the charity variant if that's what was selected
  let schema = schemas.business.legalStatusRegistration.company
  let payloadField = 'companyRegistrationNumber'
  let sessionField = 'changeBusinessCompanyRegistrationNumber'

  if (isCharity) {
    schema = schemas.business.legalStatusRegistration.charity
    payloadField = 'charityCommissionRegistrationNumber'
    sessionField = 'changeBusinessCharityCommissionRegistrationNumber'
  }

  const { error, value } = schema.validate(payload, { abortEarly: false })

  return { error, value, payloadField, sessionField }
}

export {
  validateBusinessRegistrationNumberService
}
