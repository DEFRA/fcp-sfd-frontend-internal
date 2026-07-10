/**
 * Validates personal details against the personal details schemas.
 *
 * Personal details are first mapped into a flat structure that mirrors the
 * validation schemas. Each section-specific Joi schema (e.g. name, date of birth,
 * phone, email, and optionally address) is then validated individually rather
 * than being combined into a single schema.
 *
 * Schemas are validated separately to ensure all custom validation logic runs
 * correctly. In particular, the date of birth schema includes custom validation
 * to check for real and valid dates, which may not run reliably when schemas
 * are combined using `Joi.concat`.
 *
 * If validation passes:
 * - `hasValidPersonalDetails` is `true`
 * - `sectionsNeedingUpdate` is an empty array
 *
 * If validation fails:
 * - `hasValidPersonalDetails` is `false`
 * - `sectionsNeedingUpdate` contains the personal detail sections
 *   that need to be updated (e.g. `name`, `dob`, `address`, `phone`)
 *
 * Address validation is only performed when no UPRN is present.
 *
 * This service only performs validation.
 * It does not read from or write to session state.
 *
 * @module validatePersonalDetailsService
 */

import { schemas } from '@defra/fcp-sfd-frontend-engine'

import { validateDetailsService } from '../validate-details-service.js'

const validatePersonalDetailsService = (personalDetails) => {
  const hasUprn = Boolean(personalDetails.address?.lookup?.uprn)
  const mappedPersonalDetails = mapPersonalDetails(personalDetails, hasUprn)

  const schemasToValidate = getSchemasToValidate(hasUprn)
  const { isValid: hasValidPersonalDetails, sectionsNeedingUpdate } = validateDetailsService(schemasToValidate, mappedPersonalDetails)

  return {
    hasValidPersonalDetails,
    sectionsNeedingUpdate
  }
}

const getSchemasToValidate = (hasUprn) => {
  const schemasToValidate = [
    schemas.personal.name,
    schemas.personal.dob,
    schemas.personal.phone,
    schemas.personal.email
  ]

  if (!hasUprn) {
    schemasToValidate.push(schemas.personal.address)
  }

  return schemasToValidate
}

/**
 * Maps nested personal details into a flat structure for validation.
 *
 * The flat shape mirrors the validation schema and avoids duplicating
 * nested schemas. Address fields are only included when no UPRN is present.
 */
const mapPersonalDetails = (personalDetails, hasUprn) => {
  const flatPersonalDetails = {
    first: personalDetails.info?.fullName?.first ?? '',
    last: personalDetails.info?.fullName?.last ?? '',
    middle: personalDetails.info?.fullName?.middle ?? '',
    day: personalDetails.info?.dateOfBirth?.day ?? '',
    month: personalDetails.info?.dateOfBirth?.month ?? '',
    year: personalDetails.info?.dateOfBirth?.year ?? '',
    personalEmail: personalDetails.contact?.email ?? '',
    personalTelephone: personalDetails.contact?.telephone ?? '',
    personalMobile: personalDetails.contact?.mobile ?? ''
  }

  if (!hasUprn) {
    flatPersonalDetails.address1 = personalDetails.address?.manual?.line1 ?? ''
    flatPersonalDetails.address2 = personalDetails.address?.manual?.line2 ?? ''
    flatPersonalDetails.address3 = personalDetails.address?.manual?.line3 ?? ''
    flatPersonalDetails.county = personalDetails.address?.manual?.line4 ?? ''
    flatPersonalDetails.city = personalDetails.address?.city ?? ''
    flatPersonalDetails.postcode = personalDetails.address?.postcode ?? ''
    flatPersonalDetails.country = personalDetails.address?.country ?? ''
  }

  return flatPersonalDetails
}

export {
  validatePersonalDetailsService
}
