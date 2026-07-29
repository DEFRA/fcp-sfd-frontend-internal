import { schemas } from '@defra/fcp-sfd-frontend-engine'

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
