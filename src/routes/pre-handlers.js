import { schemas } from '@defra/fcp-sfd-frontend-engine'

export const validateSbi = {
  method: async (request, h) => {
    const { sbi } = request.params
    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi').takeover()
    }

    return h.continue
  }
}

export const validateCrn = {
  method: async (request, h) => {
    const { crn } = request.params
    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn').takeover()
    }

    return h.continue
  }
}
