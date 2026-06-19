import { fetchBusinessOverviewService } from '../../services/overview/fetch-business-overview-details-service.js'
import { businessOverviewPresenter } from '../../presenters/overview/business-overview-presenter.js'

const getBusinessOverview = {
  method: 'GET',
  path: '/business-overview/{sbi}',
  handler: async (request, h) => {
    const { query: { page }, params, auth } = request
    const { sbi } = params

    const email = auth.credentials?.email
    const businessDetails = await fetchBusinessOverviewDetailsService(sbi, email)
    const pageData = businessOverviewPresenter(businessDetails, page)

    return h.view('overview/business-overview', pageData)
  }
}

export const businessOverviewRoutes = [
  getBusinessOverview
]
