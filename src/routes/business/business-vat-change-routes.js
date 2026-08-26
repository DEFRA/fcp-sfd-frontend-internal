import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'
import { businessVatChangePresenter } from '../../presenters/business/business-vat-change-presenter.js'

const getBusinessVatChange = {
  method: 'GET',
  path: '/business/{sbi}/business-vat-registration-number-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessVat')
    const pageData = businessVatChangePresenter(businessDetails)

    return h.view('business/business-vat-registration-number-change', pageData)
  }
}

const postBusinessVatChange = {
  method: 'POST',
  path: '/business/{sbi}/business-vat-registration-number-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.vat.change,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessVat')
        const pageData = businessVatChangePresenter(businessDetails, payload.vatNumber)

        return h.view('business/business-vat-registration-number-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { sbi } = request.params

      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessVat', request.payload.vatNumber)

      return h.redirect(`/business/${sbi}/business-vat-registration-number-check`)
    }
  }
}

export const businessVatChangeRoutes = [
  getBusinessVatChange,
  postBusinessVatChange
]
