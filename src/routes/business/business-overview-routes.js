import { schemas, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessOverviewService } from '../../services/business/fetch-business-overview-service.js'
import { businessOverviewPresenter } from '../../presenters/business/business-overview-presenter.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'

const BUSINESS_OVERVIEW_VIEW = 'business/business-overview'

const getBusinessOverview = {
  method: 'GET',
  path: '/business-overview',
  options: {
    validate: {
      query: schemas.business.sbi,
      options: { abortEarly: false, allowUnknown: true },
      failAction: async (_request, h, err) => {
        const errors = utils.formatValidationErrors(err.details || [])

        return h.view(BUSINESS_OVERVIEW_VIEW, { errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const sbi = request.query.sbi?.trim() ?? ''

      if (sbi === '') {
        return h.redirect('/search-sbi')
      }

      const email = request.auth.credentials?.email
      const page = parseInt(request.query.page, 10) || 1

      const businessOverview = await fetchBusinessOverviewService(sbi, email)
      const pageData = businessOverviewPresenter(businessOverview, page)

      return h.view(BUSINESS_OVERVIEW_VIEW, pageData)
    }
  }
}

export const businessOverviewRoutes = [
  getBusinessOverview
]
