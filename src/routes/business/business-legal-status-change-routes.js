import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessLegalStatusChangePresenter } from '../../presenters/business/business-legal-status-change-presenter.js'

const getBusinessLegalStatusChange = {
  method: 'GET',
  path: '/business-legal-status-change',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessDetailsService(yar, auth.credentials)
    const pageData = businessLegalStatusChangePresenter(businessDetails)

    return h.view('business/business-legal-status-change', pageData)
  }
}

export const businessLegalStatusRoutes = [
  getBusinessLegalStatusChange
]
