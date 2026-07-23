/**
 * Validates business details against the business details schemas.
 *
 * Business details are first mapped into a flat structure that mirrors the
 * validation schemas. Each section-specific Joi schema (e.g. business name,
 * phone, email, and optionally address) is then validated individually rather
 * than being combined into a single schema.
 *
 * Schemas are validated separately to ensure all custom validation logic runs
 * correctly, which may not run reliably when schemas are combined using
 * `Joi.concat`.
 *
 * If validation passes:
 * - `hasValidBusinessDetails` is `true`
 * - `sectionsNeedingUpdate` is an empty array
 *
 * If validation fails:
 * - `hasValidBusinessDetails` is `false`
 * - `sectionsNeedingUpdate` contains the business detail sections
 *   that need to be updated (e.g. `name`, `address`, `phone`, `email`, `vat`)
 *
 * Address validation is only performed when no UPRN is present.
 *
 * This service only performs validation.
 * It does not read from or write to session state.
 *
 * The caller is responsible for handling any interrupter
 * journey behaviour and persisting validation results.
 *
 * @module validateBusinessDetailsService
 */

import { schemas } from '@defra/fcp-sfd-frontend-engine'
import { validateDetailsService } from '../validate-details-service.js'

const validateBusinessDetailsService = (businessDetails) => {
  const mappedBusinessDetails = mapBusinessDetails(businessDetails)

  const schemasToValidate = getSchemasToValidate()

  const { isValid: hasValidBusinessDetails, sectionsNeedingUpdate } = validateDetailsService(schemasToValidate, mappedBusinessDetails)

  return {
    hasValidBusinessDetails,
    sectionsNeedingUpdate
  }
}

const getSchemasToValidate = () => {
  const schemasToRun = [
    schemas.business.details.email
  ]

  return schemasToRun
}

/**
 * Maps nested business details into a flat structure for validation.
 *
 * The flat shape mirrors the validation schema and avoids duplicating
 * nested schemas. Address fields are only included when no UPRN is present.
 */
const mapBusinessDetails = (businessDetails) => {
  const flatBusinessDetails = {
    businessEmail: businessDetails.contact?.email ?? ''
  }

  return flatBusinessDetails
}

export {
  validateBusinessDetailsService
}
