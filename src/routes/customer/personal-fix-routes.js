import { services } from '@defra/fcp-sfd-frontend-engine'

import { personalFixPresenter } from '../../presenters/personal/personal-fix-presenter.js'
import { fetchPersonalFixService } from '../../services/fetch-personal-fix-service.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalFix = {
  method: 'GET',
  path: '/customer/{crn}/details/fix',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, yar, auth, query } = request
    const { crn } = params

    const sessionData = services.initialiseFixJourney(yar, query.source, 'personal')
    const personalDetails = await fetchPersonalFixService(crn, auth.credentials?.email, sessionData)
    const pageData = personalFixPresenter(personalDetails, crn)

    return h.view('personal/personal-fix.njk', pageData)
  }
}

const postPersonalFix = {
  method: 'POST',
  path: '/customer/{crn}/details/fix',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params } = request
    const { crn } = params

    return h.redirect(`/customer/${crn}/details/fix-list`)
  }
}

export const personalFixRoutes = [
  getPersonalFix,
  postPersonalFix
]
