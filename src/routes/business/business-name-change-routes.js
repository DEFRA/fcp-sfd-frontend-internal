import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessNameChangePresenter } from '../../presenters/business/business-name-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessNameChange = {
  method: 'GET',
  path: '/business/{sbi}/business-name-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessName')
    const pageData = businessNameChangePresenter(businessDetails)

    return h.view('business/business-name-change', pageData)
  }
}

const postBusinessNameChange = {
  method: 'POST',
  path: '/business/{sbi}/business-name-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.details.name,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessName')
        const pageData = businessNameChangePresenter(businessDetails, payload.businessName)

        return h.view('business/business-name-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { sbi } = request.params

      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessName', request.payload.businessName)

      return h.redirect(`/business/${sbi}/business-name-check`)
    }
  }
}

export const businessNameChangeRoutes = [
  getBusinessNameChange,
  postBusinessNameChange
]
