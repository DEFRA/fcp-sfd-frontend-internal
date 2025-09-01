import { businessPhoneSchema } from '../../schemas/business/business-phone-schema.js'
import { formatValidationErrors } from '../../utils/format-validation-errors.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { businessPhoneNumbersChangePresenter } from '../../presenters/business/business-phone-numbers-change-presenter.js'
import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getBusinessPhoneNumbersChange = {
  method: 'GET',
  path: '/business-phone-numbers-change',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessDetailsService(yar, auth.credentials)
    const pageData = businessPhoneNumbersChangePresenter(businessDetails)

    return h.view('business/business-phone-numbers-change', pageData)
  }
}

const postBusinessPhoneNumbersChange = {
  method: 'POST',
  path: '/business-phone-numbers-change',
  options: {
    validate: {
      payload: businessPhoneSchema,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const errors = formatValidationErrors(err.details || [])
        const businessDetailsData = request.yar.get('businessDetails')
        const pageData = businessPhoneNumbersChangePresenter(businessDetailsData, request.payload)

        return h.view('business/business-phone-numbers-change', { ...pageData, errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: (request, h) => {
      setSessionData(request.yar, 'businessDetails', 'changeBusinessTelephone', request.payload.businessTelephone ?? null)
      setSessionData(request.yar, 'businessDetails', 'changeBusinessMobile', request.payload.businessMobile ?? null)

      return h.redirect('/business-phone-numbers-check')
    }
  }
}

export const businessPhoneNumbersChangeRoutes = [
  getBusinessPhoneNumbersChange,
  postBusinessPhoneNumbersChange
]
