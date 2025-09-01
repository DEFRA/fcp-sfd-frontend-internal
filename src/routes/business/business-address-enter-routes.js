import { businessAddressSchema } from '../../schemas/business/business-address-schema.js'
import { formatValidationErrors } from '../../utils/format-validation-errors.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { businessAddressEnterPresenter } from '../../presenters/business/business-address-enter-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'

const getBusinessAddressEnter = {
  method: 'GET',
  path: '/business-address-enter',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessDetailsService(yar, auth.credentials)
    const pageData = businessAddressEnterPresenter(businessDetails)

    return h.view('business/business-address-enter', pageData)
  }
}

const postBusinessAddressEnter = {
  method: 'POST',
  path: '/business-address-enter',
  options: {
    validate: {
      payload: businessAddressSchema,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const errors = formatValidationErrors(err.details || [])
        const businessDetailsData = request.yar.get('businessDetails')
        const pageData = businessAddressEnterPresenter(businessDetailsData, request.payload)

        return h.view('business/business-address-enter', { ...pageData, errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: (request, h) => {
      setSessionData(request.yar, 'businessDetails', 'changeBusinessAddress', request.payload)

      return h.redirect('/business-address-check')
    }
  }
}

export const businessAddressRoutes = [
  getBusinessAddressEnter,
  postBusinessAddressEnter
]
