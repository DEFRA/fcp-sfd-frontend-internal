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
    const { params, yar, auth, info } = request
    const { sbi } = params
    const email = auth.credentials?.email

    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
    const pageData = businessVatChangePresenter(businessDetails, undefined, info.referrer)

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
        const { yar, auth, payload, info, params } = request
        const { sbi } = params
        const email = auth.credentials?.email

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
        const pageData = businessVatChangePresenter(businessDetails, payload.vatNumber, info.referrer)

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
