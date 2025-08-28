import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessVatChangePresenter } from '../../presenters/business/business-vat-change-presenter.js'
import { businessVatSchema } from '../../schemas/business/business-vat-schema.js'
import { formatValidationErrors } from '../../utils/format-validation-errors.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getBusinessVatChange = {
  method: 'GET',
  path: '/business-vat-change',
  handler: async (request, h) => {
    const businessDetails = await fetchBusinessDetailsService(request.yar, request.auth.credentials)
    const pageData = businessVatChangePresenter(businessDetails)

    return h.view('business/business-vat-change', pageData)
  }
}

const postBusinessVatChange = {
  method: 'POST',
  path: '/business-vat-change',
  options: {
    validate: {
      payload: businessVatSchema,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const errors = formatValidationErrors(err.details || [])
        const businessDetailsData = request.yar.get('businessDetails')
        const pageData = businessVatChangePresenter(businessDetailsData, request.payload.vatNumber)

        return h.view('business/business-vat-change', { ...pageData, errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      setSessionData(request.yar, 'businessDetails', 'changeBusinessVat', request.payload.vatNumber)

      return h.redirect('/business-vat-check')
    }
  }
}

export const businessVatChangeRoutes = [
  getBusinessVatChange,
  postBusinessVatChange
]
