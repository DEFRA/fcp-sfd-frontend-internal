import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessVatRemoveService } from '../../services/business/update-business-vat-remove-service.js'
import { businessVatRemovePresenter } from '../../presenters/business/business-vat-remove-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessVatRemove = {
  method: 'GET',
  path: '/business/{sbi}/business-vat-registration-remove',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessVat')
    const pageData = businessVatRemovePresenter(businessDetails)

    return h.view('business/business-vat-registration-remove', pageData)
  }
}

const postBusinessVatRemove = {
  method: 'POST',
  path: '/business/{sbi}/business-vat-registration-remove',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.vat.remove,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessVat')
        const pageData = businessVatRemovePresenter(businessDetails)

        return h.view('business/business-vat-registration-remove', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { sbi } = request.params

    if (request.payload.confirmRemove === 'yes') {
      await updateBusinessVatRemoveService(request.yar, request.auth.credentials)
    }

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessVatRemoveRoutes = [
  getBusinessVatRemove,
  postBusinessVatRemove
]
