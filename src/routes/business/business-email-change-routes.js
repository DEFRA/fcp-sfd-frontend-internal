import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessEmailChangePresenter } from '../../presenters/business/business-email-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { AMEND_PERMISSIONS } from '../../constants/scope/business-details.js'

const getBusinessEmailChange = {
  method: 'GET',
  path: '/business-email-change',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessEmail')
    const pageData = businessEmailChangePresenter(businessDetails)

    return h.view('business/business-email-change', pageData)
  }
}

const postBusinessEmailChange = {
  method: 'POST',
  path: '/business-email-change',
  options: {
    validate: {
      payload: schemas.business.details.email,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessEmail')
        const pageData = businessEmailChangePresenter(businessDetails, payload.businessEmail)

        return h.view('business/business-email-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessEmail', request.payload.businessEmail)

      return h.redirect('/business-email-check')
    }
  }
}

export const businessEmailChangeRoutes = [
  getBusinessEmailChange,
  postBusinessEmailChange
]
