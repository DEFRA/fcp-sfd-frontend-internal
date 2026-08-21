import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
// import { updateBusinessLegalStatusChangeService } from '../../services/business/update-business-legal-status-change-service.js'
import { businessLegalStatusCheckPresenter } from '../../presenters/business/business-legal-status-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'
import { BUSINESS_LEGAL_STATUS_SESSION_FIELDS } from '../../constants/business-legal-status-session-fields.js'

const getBusinessLegalStatusCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-legal-status-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessLegalStatusChange = await fetchBusinessChangeService(yar, auth.credentials, BUSINESS_LEGAL_STATUS_SESSION_FIELDS)
    const pageData = businessLegalStatusCheckPresenter(businessLegalStatusChange)

    return h.view('business/business-legal-status-check', pageData)
  }
}

const postBusinessLegalStatusCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-legal-status-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params } = request
    const { sbi } = params

    // await updateBusinessLegalStatusChangeService(request.yar, request.auth.credentials)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessLegalStatusCheckRoutes = [
  getBusinessLegalStatusCheck,
  postBusinessLegalStatusCheck
]
