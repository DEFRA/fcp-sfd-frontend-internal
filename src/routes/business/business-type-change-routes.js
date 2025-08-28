import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessTypeChangePresenter } from '../../presenters/business/business-type-change-presenter.js'

const getBusinessTypeChange = {
  method: 'GET',
  path: '/business-type-change',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessDetailsService(yar, auth.credentials)
    const pageData = businessTypeChangePresenter(businessDetails)

    return h.view('business/business-type-change', pageData)
  }
}

export const businessTypeRoutes = [
  getBusinessTypeChange
]
