import { fetchPersonalFixService } from '../../services/fetch-personal-fix-service.js'
import { personalFixCheckPresenter } from '../../presenters/personal/personal-fix-check-presenter.js'
import { updatePersonalFixService } from '../../services/personal/update-personal-fix-service.js'
import { checkCrnAndInterrupterJourney } from '../pre-handlers.js'
import { PERSONAL_DETAILS_VALIDATION_JOURNEY } from '../../constants/journeys.js'

const getPersonalFixCheck = {
  method: 'GET',
  path: '/customer/{crn}/details/fix-check',
  options: {
    pre: [checkCrnAndInterrupterJourney(PERSONAL_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { crn } = params

    const sessionData = yar.get('personalDetailsValidation')
    const personalDetails = await fetchPersonalFixService(crn, auth.credentials?.email, sessionData)
    const pageData = personalFixCheckPresenter(personalDetails, crn)

    return h.view('personal/personal-fix-check.njk', pageData)
  }
}

const postPersonalFixCheck = {
  method: 'POST',
  path: '/customer/{crn}/details/fix-check',
  options: {
    pre: [checkCrnAndInterrupterJourney(PERSONAL_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { crn } = params

    const sessionData = yar.get('personalDetailsValidation')
    await updatePersonalFixService(crn, sessionData, yar, auth.credentials?.email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalFixCheckRoutes = [
  getPersonalFixCheck,
  postPersonalFixCheck
]
