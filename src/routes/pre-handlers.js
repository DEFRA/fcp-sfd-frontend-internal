import { schemas, services } from '@defra/fcp-sfd-frontend-engine'

/**
 * Creates a Hapi pre-handler that checks the interrupted journey session.
 * Redirects to the given path if the session is invalid.
 * Used to guard fix/interrupter journey routes.
 *
 * @param {Object} journey - Journey configuration object with journeyKey and redirectPath properties
 * @returns {Object} Hapi pre-handler object
 */
export const checkInterrupterJourneyPreHandler = (journey) => {
  return {
    method: (request, h) => {
      const { yar, params } = request
      const { crn } = params

      const isValid = services.checkInterrupterJourneySession(yar, journey.journeyKey)

      if (!isValid) {
        return h.redirect(journey.redirectPath.replace('{crn}', crn)).takeover()
      }

      return true
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
