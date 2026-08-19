import { utils, schemas, constants, services } from '@defra/fcp-sfd-frontend-engine'

import { personalFixListPresenter } from '../../presenters/personal/personal-fix-list-presenter.js'
import { fetchPersonalFixService } from '../../services/fetch-personal-fix-service.js'
import { PERSONAL_DETAILS_VALIDATION_JOURNEY } from '../../constants/journeys.js'
import { checkCrnAndInterrupterJourney } from '../pre-handlers.js'

const getPersonalFixList = {
  method: 'GET',
  path: '/customer/{crn}/details/fix-list',
  options: {
    pre: [checkCrnAndInterrupterJourney(PERSONAL_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { crn } = params

    const sessionData = yar.get('personalDetailsValidation') || {}
    const personalDetails = await fetchPersonalFixService(crn, auth.credentials?.email, sessionData)
    const pageData = personalFixListPresenter(personalDetails, null, crn, null)

    return h.view('personal/personal-fix-list.njk', pageData)
  }
}

const postPersonalFixList = {
  method: 'POST',
  path: '/customer/{crn}/details/fix-list',
  options: {
    pre: [checkCrnAndInterrupterJourney(PERSONAL_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth, payload } = request
    const { crn } = params

    const sessionData = yar.get('personalDetailsValidation')
    const validation = services.validateFixDetails(payload, sessionData.orderedSectionsToFix, schemas.personal)

    if (validation.error) {
      const errors = utils.formatValidationErrors(validation.error.details || [])
      const personalDetails = await fetchPersonalFixService(crn, auth.credentials?.email, sessionData)
      const pageData = personalFixListPresenter(personalDetails, payload, crn, errors)

      return h.view('personal/personal-fix-list.njk', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
    }

    services.setFixSessionData(yar, sessionData, payload, 'personalDetailsValidation', 'personalFixUpdates')

    return h.redirect(`/customer/${crn}/details/fix-check`)
  }
}

export const personalFixListRoutes = [
  getPersonalFixList,
  postPersonalFixList
]
