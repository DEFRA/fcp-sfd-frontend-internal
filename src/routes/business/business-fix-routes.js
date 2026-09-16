import { services } from '@defra/fcp-sfd-frontend-engine'

import { businessFixPresenter } from '../../presenters/business/business-fix-presenter.js'
import { fetchBusinessFixService } from '../../services/business/fetch-business-fix-service.js'
import { BUSINESS_DETAILS_VALIDATION_JOURNEY } from '../../constants/journeys.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessFix = {
  method: 'GET',
  path: '/business/{sbi}/details/fix',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, query } = request
    const { sbi } = params

    const sessionData = services.initialiseFixJourney(yar, query.source, 'business')

    // No sections to fix means the journey can't start, e.g. the user has
    // already submitted and is navigating back
    if (!sessionData?.orderedSectionsToFix) {
      return h.redirect(BUSINESS_DETAILS_VALIDATION_JOURNEY.redirectPath.replace('{sbi}', sbi))
    }

    const businessDetails = await fetchBusinessFixService(sbi, auth.credentials?.email, sessionData)
    const pageData = businessFixPresenter(businessDetails, sbi)

    return h.view('business/business-fix.njk', pageData)
  }
}

const postBusinessFix = {
  method: 'POST',
  path: '/business/{sbi}/details/fix',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params } = request
    const { sbi } = params

    return h.redirect(`/business/${sbi}/details/fix-list`)
  }
}

export const businessFixRoutes = [
  getBusinessFix,
  postBusinessFix
]
