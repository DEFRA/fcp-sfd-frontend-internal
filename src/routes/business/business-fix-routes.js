import { services } from '@defra/fcp-sfd-frontend-engine'

import { businessFixPresenter } from '../../presenters/business/business-fix-presenter.js'
import { fetchBusinessFixService } from '../../services/business/fetch-business-fix-service.js'
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
