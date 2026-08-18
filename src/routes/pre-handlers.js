import { schemas, services } from '@defra/fcp-sfd-frontend-engine'

/**
 * Creates a Hapi pre-handler that validates a CRN and checks the interrupted journey session.
 * First validates the CRN parameter, then checks if the journey session is valid.
 * Redirects to the given path if either validation fails.
 * Used to guard CRN-based fix/interrupter journey routes.
 *
 * @param {Object} journey - Journey configuration object with journeyKey and redirectPath properties
 * @returns {Object} Hapi pre-handler object
 */
export const checkCRNAndInterrupterJourney = (journey) => {
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
export const checkSBIAndInterrupterJourney = (journey) => {
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
