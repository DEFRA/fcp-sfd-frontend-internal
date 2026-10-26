/**
 * Session fields used by the business legal status journey
 *
 * @module businessLegalStatusSessionFields
 */

// Shared across the legal status change/enter/check routes, so a single list stays in sync with the session keys
export const BUSINESS_LEGAL_STATUS_SESSION_FIELDS = [
  'changeBusinessLegalStatus',
  'changeBusinessCharityCommissionRegistrationNumber',
  'changeBusinessCompanyRegistrationNumber'
]
