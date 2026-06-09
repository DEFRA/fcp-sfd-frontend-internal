import { schemas, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessOverviewService } from '../../services/business/fetch-business-overview-service.js'
import { businessOverviewPresenter } from '../../presenters/business/business-overview-presenter.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'

const BUSINESS_OVERVIEW_VIEW = 'business/business-overview'

const getBusinessOverview = {
  method: 'GET',
  path: '/business-overview',
  handler: async (request, h) => {
    const sbiInput = request.query.sbi?.trim() ?? ''

    if (sbiInput === '') {
      return h.redirect('/search-sbi')
    }

    const validation = schemas.business.sbi.validate({ sbi: sbiInput })

    if (validation.error) {
      const errors = utils.formatValidationErrors(validation.error.details || [])
      return h.view(BUSINESS_OVERVIEW_VIEW, { errors }).code(BAD_REQUEST)
    }

    const { sbi } = validation.value
    const email = request.auth.credentials?.email

    const businessOverview = await fetchBusinessOverviewService(sbi, email)
    const pageData = businessOverviewPresenter(businessOverview)

    return h.view(BUSINESS_OVERVIEW_VIEW, pageData)
  }
}

export const businessOverviewRoutes = [
  getBusinessOverview
]
