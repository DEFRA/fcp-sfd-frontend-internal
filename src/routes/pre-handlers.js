import { schemas } from '@defra/fcp-sfd-frontend-engine'

export const validateSbi = {
  method: (request, h) => {
    const sbiInput = request.params?.sbi ?? ''
    const validation = schemas.business.sbi.validate({ sbi: sbiInput })

    if (validation.error) {
      return h.redirect('/search-sbi').takeover()
    }

    request.params.sbi = validation.value.sbi

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
