import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessNameChangePresenter } from '../../presenters/business/business-name-change-presenter.js'
import { businessNameSchema } from '../../schemas/business/business-name-schema.js'
import { formatValidationErrors } from '../../utils/format-validation-errors.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getBusinessNameChange = {
  method: 'GET',
  path: '/business-name-change',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessDetailsService(yar, auth.credentials)
    const pageData = businessNameChangePresenter(businessDetails)

    return h.view('business/business-name-change', pageData)
  }
}

const postBusinessNameChange = {
  method: 'POST',
  path: '/business-name-change',
  options: {
    validate: {
      payload: businessNameSchema,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const errors = formatValidationErrors(err.details || [])
        const businessDetailsData = request.yar.get('businessDetails')
        const pageData = businessNameChangePresenter(businessDetailsData, request.payload.businessName)

        return h.view('business/business-name-change', { ...pageData, errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      setSessionData(request.yar, 'businessDetails', 'changeBusinessName', request.payload.businessName)

      return h.redirect('/business-name-check')
    }
  }
}

export const businessNameChangeRoutes = [
  getBusinessNameChange,
  postBusinessNameChange
]
