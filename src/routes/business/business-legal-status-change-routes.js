import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessLegalStatusChangePresenter } from '../../presenters/business/business-legal-status-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessLegalStatusChange = {
  method: 'GET',
  path: '/business/{sbi}/business-legal-status-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessLegalStatus')
    const pageData = businessLegalStatusChangePresenter(businessDetails)

    return h.view('business/business-legal-status-change', pageData)
  }
}

const postBusinessLegalStatusChange = {
  method: 'POST',
  path: '/business/{sbi}/business-legal-status-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.legalStatus,
      options: {
        abortEarly: false
      },
      failAction: async (request, h, err) => {
        const { yar, auth, payload } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessLegalStatus')
        const pageData = businessLegalStatusChangePresenter(businessDetails, payload.businessLegalStatus)

        return h.view('business/business-legal-status-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { sbi } = request.params
      const { businessLegalStatus } = request.payload

      setSessionData(request.yar, 'businessDetailsUpdate', 'changeBusinessLegalStatus', businessLegalStatus)

      // Only these statuses require a registration number, so route the rest straight to the check page
      const requiresRegistrationNumber = [
        ...constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES,
        ...constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES
      ].includes(businessLegalStatus)

      const nextPage = requiresRegistrationNumber ? 'business-legal-status-enter' : 'business-legal-status-check'

      return h.redirect(`/business/${sbi}/${nextPage}`)
    }
  }
}

export const businessLegalStatusChangeRoutes = [
  getBusinessLegalStatusChange,
  postBusinessLegalStatusChange
]
