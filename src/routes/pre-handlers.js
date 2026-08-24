import { schemas, services, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../services/business/fetch-business-change-service.js'
import { BUSINESS_LEGAL_STATUS_SESSION_FIELDS } from '../constants/business-legal-status-session-fields.js'

/**
 * Creates a Hapi pre-handler that validates a CRN and checks the interrupted journey session.
 * First validates the CRN parameter, then checks if the journey session is valid.
 * Redirects to the given path if either validation fails.
 * Used to guard CRN-based fix/interrupter journey routes.
 *
 * @param {Object} journey - Journey configuration object with journeyKey and redirectPath properties
 * @returns {Object} Hapi pre-handler object
 */
export const checkCrnAndInterrupterJourney = (journey) => {
  return {
    method: (request, h) => {
      // First validate the CRN parameter
      const crnValidation = validateCrn.method(request, h)
      if (crnValidation !== h.continue) {
        return crnValidation
      }

      // Then check the interrupter journey session
      const { yar, params } = request
      const { crn } = params

      const isValid = services.checkInterrupterJourneySession(yar, journey.journeyKey)

      if (!isValid) {
        return h.redirect(journey.redirectPath.replace('{crn}', crn)).takeover()
      }

      return h.continue
    }
  }
}

/**
 * Creates a Hapi pre-handler that validates an SBI and checks the interrupted journey session.
 * First validates the SBI parameter, then checks if the journey session is valid.
 * Redirects to the given path if either validation fails.
 * Used to guard SBI-based fix/interrupter journey routes.
 *
 * @param {Object} journey - Journey configuration object with journeyKey and redirectPath properties
 * @returns {Object} Hapi pre-handler object
 */
export const checkSbiAndInterrupterJourney = (journey) => {
  return {
    method: (request, h) => {
      // First validate the SBI parameter
      const sbiValidation = validateSbi.method(request, h)
      if (sbiValidation !== h.continue) {
        return sbiValidation
      }

      // Then check the interrupter journey session
      const { yar, params } = request
      const { sbi } = params

      const isValid = services.checkInterrupterJourneySession(yar, journey.journeyKey)

      if (!isValid) {
        return h.redirect(journey.redirectPath.replace('{sbi}', sbi)).takeover()
      }

      return h.continue
    }
  }
}

export const validateSbi = {
  method: (request, h) => {
    const sbiInput = request.params?.sbi ?? ''
    const validation = schemas.business.sbi.validate({ sbi: sbiInput })

    if (validation.error) {
      return h.redirect('/search-sbi').takeover()
    }

    // Mutate params with the Joi-coerced value to ensure downstream handlers
    // work with the normalised input
    request.params.sbi = validation.value.sbi

    return h.continue
  }
}

export const validateCrn = {
  method: (request, h) => {
    const crnInput = request.params?.crn ?? ''
    const validation = schemas.customer.crn.validate({ crn: crnInput })

    if (validation.error) {
      return h.redirect('/search-crn').takeover()
    }

    // Mutate params with the Joi-coerced value to ensure downstream handlers
    // work with the normalised input
    request.params.crn = validation.value.crn

    return h.continue
  }
}

/**
 * Pre-handler that validates a business legal status change has a required registration number.
 * If the selected legal status requires a registration number (charity or company),
 * this handler ensures one has been entered. If missing, redirects to the enter page.
 * Prevents users from bypassing the registration number capture step.
 */
export const validateLegalStatusRegistrationNumber = {
  method: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, BUSINESS_LEGAL_STATUS_SESSION_FIELDS)

    const legalStatusCode = String(businessDetails.changeBusinessLegalStatus ?? businessDetails.info?.legalStatusCode ?? '')

    const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)
    const isCompany = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)

    if (isCharity || isCompany) {
      const charityNumber = businessDetails.changeBusinessCharityCommissionRegistrationNumber
      const companyNumber = businessDetails.changeBusinessCompanyRegistrationNumber

      const charityRequired = isCharity && !charityNumber
      const companyRequired = isCompany && !companyNumber

      if (charityRequired || companyRequired) {
        return h.redirect(`/business/${sbi}/business-legal-status-enter`).takeover()
      }
    }

    return h.continue
  }
}
