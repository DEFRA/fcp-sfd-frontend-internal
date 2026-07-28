import { schemas } from '@defra/fcp-sfd-frontend-engine'

/**
 * Validates an SBI and, when invalid, returns a takeover redirect to the SBI search page
 * @module validateSbi
 */

/**
 * Validates an SBI and, when invalid, returns a takeover redirect to the SBI search page
 *
 * Business routes take the SBI from the URL and must guard against an invalid value before
 * doing any work. Keeping that guard here avoids repeating the identical validate/redirect
 * block in every business route handler.
 *
 * Returns `null` when the SBI is valid so callers can continue processing the request.
 *
 * @param {string} sbi - The SBI taken from the request params
 * @param {object} h - The hapi response toolkit
 *
 * @returns {object|null} A takeover redirect response when the SBI is invalid, otherwise `null`
 */
const validateSbi = (sbi, h) => {
  const { error } = schemas.business.sbi.validate({ sbi })

  if (error) {
    return h.redirect('/search-sbi').takeover()
  }

  return null
}

export {
  validateSbi
}
