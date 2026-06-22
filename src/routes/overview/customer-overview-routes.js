import { fetchCustomerOverviewDetailsService } from '../../services/overview/fetch-customer-overview-details-service.js'
import { customerOverviewPresenter } from '../../presenters/overview/customer-overview-presenter.js'
import { schemas } from '@defra/fcp-sfd-frontend-engine'

const getCustomerOverview = {
  method: 'GET',
  path: '/customer-overview/{crn}',
  handler: async (request, h) => {
    const { query: { page }, params, auth } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn').takeover()
    }

    const email = auth.credentials?.email
    const customerDetails = await fetchCustomerOverviewDetailsService(crn, email)
    const pageData = customerOverviewPresenter(customerDetails, page)

    return h.view('overview/customer-overview', pageData)
  }
}

export const customerOverviewRoutes = [
  getCustomerOverview
]
