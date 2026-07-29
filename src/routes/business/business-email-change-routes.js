import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessEmailChangePresenter } from '../../presenters/business/business-email-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessEmailChange = {
  method: 'GET',
  path: '/business/{sbi}/business-email-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, info } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessEmail')
    const pageData = businessEmailChangePresenter(businessDetails, undefined, info.referrer)

    return h.view('business/business-email-change', pageData)
  }
}

const postBusinessEmailChange = {
  method: 'POST',
  path: '/business/{sbi}/business-email-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.details.email,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload, info } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessEmail')
        const pageData = businessEmailChangePresenter(businessDetails, payload.businessEmail, info.referrer)

        return h.view('business/business-email-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { sbi } = request.params

      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessEmail', request.payload.businessEmail)

      return h.redirect(`/business/${sbi}/business-email-check`)
    }
  }
}

export const businessEmailChangeRoutes = [
  getBusinessEmailChange,
  postBusinessEmailChange
]
