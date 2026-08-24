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
    const email = auth.credentials?.email

    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
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
        const { yar, auth, payload, params } = request
        const { sbi } = params
        const email = auth.credentials?.email

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
        const pageData = businessVatRemovePresenter(businessDetails, payload?.confirmRemove)

        return h.view('business/business-vat-registration-remove', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { sbi } = request.params
    const email = request.auth.credentials?.email

    if (request.payload.confirmRemove === 'yes') {
      await updateBusinessVatRemoveService(request.yar, sbi, email)
    } else {
      request.yar.clear('businessDetailsUpdate')
    }

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessVatRemoveRoutes = [
  getBusinessVatRemove,
  postBusinessVatRemove
]
