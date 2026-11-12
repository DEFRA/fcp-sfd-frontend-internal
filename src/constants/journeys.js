/**
 * Session journey configurations for route guards and pre-handlers.
 * Each journey defines the session key and redirect path for a change/fix workflow.
 * The field being checked is passed separately to checkSessionDataGuard.
 */

// Personal fix (interrupter) journey
export const PERSONAL_DETAILS_VALIDATION_JOURNEY = {
  journeyKey: 'personalDetailsValidation',
  redirectPath: '/customer/{crn}/details'
}

// Business fix (interrupter) journey
export const BUSINESS_DETAILS_VALIDATION_JOURNEY = {
  journeyKey: 'businessDetailsValidation',
  redirectPath: '/business/{sbi}/details'
}
