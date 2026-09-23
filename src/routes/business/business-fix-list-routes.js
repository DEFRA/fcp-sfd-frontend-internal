import { utils, schemas, constants, services } from '@defra/fcp-sfd-frontend-engine'

import { businessFixListPresenter } from '../../presenters/business/business-fix-list-presenter.js'
import { fetchBusinessFixService } from '../../services/business/fetch-business-fix-service.js'
import { BUSINESS_DETAILS_VALIDATION_JOURNEY } from '../../constants/journeys.js'
import { checkSbiAndInterrupterJourney } from '../pre-handlers.js'

const getBusinessFixList = {
  method: 'GET',
  path: '/business/{sbi}/details/fix-list',
  options: {
    pre: [checkSbiAndInterrupterJourney(BUSINESS_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    const sessionData = yar.get('businessDetailsValidation') || {}
    const businessDetails = await fetchBusinessFixService(sbi, auth.credentials?.email, sessionData)
    const pageData = businessFixListPresenter(businessDetails, null, sbi, null)

    return h.view('business/business-fix-list.njk', pageData)
  }
}

const postBusinessFixList = {
  method: 'POST',
  path: '/business/{sbi}/details/fix-list',
  options: {
    pre: [checkSbiAndInterrupterJourney(BUSINESS_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth, payload } = request
    const { sbi } = params

    const sessionData = yar.get('businessDetailsValidation')
    const validation = services.validateFixDetails(payload, sessionData.orderedSectionsToFix, schemas.business.details)

    if (validation.error) {
      const errors = utils.formatValidationErrors(validation.error.details || [])
      const businessDetails = await fetchBusinessFixService(sbi, auth.credentials?.email, sessionData)
      const pageData = businessFixListPresenter(businessDetails, payload, sbi, errors)

      return h.view('business/business-fix-list.njk', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
    }

    services.setFixSessionData(yar, sessionData, payload, 'businessDetailsValidation', 'businessFixUpdates')

    return h.redirect(`/business/${sbi}/details/fix-check`)
  }
}

export const businessFixListRoutes = [
  getBusinessFixList,
  postBusinessFixList
]
