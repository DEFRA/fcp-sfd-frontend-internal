import { utils, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { validateBusinessRegistrationNumberService } from '../../services/business/validate-business-registration-number-service.js'
import { businessLegalStatusEnterPresenter } from '../../presenters/business/business-legal-status-enter-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'
import { BUSINESS_LEGAL_STATUS_SESSION_FIELDS } from '../../constants/business-legal-status-session-fields.js'

const getBusinessLegalStatusEnter = {
  method: 'GET',
  path: '/business/{sbi}/business-legal-status-enter',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { yar, auth } = request

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, BUSINESS_LEGAL_STATUS_SESSION_FIELDS)
    const pageData = businessLegalStatusEnterPresenter(businessDetails)

    return h.view('business/business-legal-status-enter', pageData)
  }
}

const postBusinessLegalStatusEnter = {
  method: 'POST',
  path: '/business/{sbi}/business-legal-status-enter',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, payload } = request
    const { sbi } = params

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, BUSINESS_LEGAL_STATUS_SESSION_FIELDS)
    const legalStatusCode = businessDetails.changeBusinessLegalStatus ?? businessDetails.info?.legalStatusCode
    const { error, value, payloadField, sessionField } = validateBusinessRegistrationNumberService(legalStatusCode, payload)

    if (error) {
      const errors = utils.formatValidationErrors(error.details)
      const pageData = businessLegalStatusEnterPresenter(businessDetails, payload)

      return h.view('business/business-legal-status-enter', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST)
    }

    setSessionData(yar, 'businessDetailsUpdate', sessionField, value[payloadField])

    return h.redirect(`/business/${sbi}/business-legal-status-check`)
  }
}

export const businessLegalStatusEnterRoutes = [
  getBusinessLegalStatusEnter,
  postBusinessLegalStatusEnter
]
