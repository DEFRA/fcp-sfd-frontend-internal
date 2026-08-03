import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessPhoneNumbersChangePresenter } from '../../presenters/business/business-phone-numbers-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessPhoneNumbersChange = {
  method: 'GET',
  path: '/business/{sbi}/business-phone-numbers-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, info } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessPhoneNumbers')
    const pageData = businessPhoneNumbersChangePresenter(businessDetails, undefined, info.referrer)

    return h.view('business/business-phone-numbers-change', pageData)
  }
}

const postBusinessPhoneNumbersChange = {
  method: 'POST',
  path: '/business/{sbi}/business-phone-numbers-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.details.phone,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessPhoneNumbers')
        const pageData = businessPhoneNumbersChangePresenter(businessDetails, payload)

        return h.view('business/business-phone-numbers-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { sbi } = request.params

      request.payload = {
        businessTelephone: request.payload.businessTelephone ?? null,
        businessMobile: request.payload.businessMobile ?? null
      }

      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessPhoneNumbers', request.payload)

      return h.redirect(`/business/${sbi}/business-phone-numbers-check`)
    }
  }
}

export const businessPhoneNumbersChangeRoutes = [
  getBusinessPhoneNumbersChange,
  postBusinessPhoneNumbersChange
]
