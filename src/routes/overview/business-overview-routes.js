import { fetchBusinessOverviewDetailsService } from '../../services/overview/fetch-business-overview-details-service.js'
import { businessOverviewPresenter } from '../../presenters/overview/business-overview-presenter.js'
import { schemas } from '@defra/fcp-sfd-frontend-engine'

const getBusinessOverview = {
  method: 'GET',
  path: '/business-overview/{sbi}',
  handler: async (request, h) => {
    const { query: { page }, params, auth } = request
    const { sbi } = params

    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi').takeover()
    }

    const email = auth.credentials?.email
    const businessDetails = await fetchBusinessOverviewDetailsService(sbi, email)
    const pageData = businessOverviewPresenter(businessDetails, page)

    return h.view('overview/business-overview', pageData)
  }
}

export const businessOverviewRoutes = [
  getBusinessOverview
]
