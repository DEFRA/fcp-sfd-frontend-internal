import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessDetailsPresenter } from '../../presenters/business/business-details-presenter.js'
import { schemas } from '@defra/fcp-sfd-frontend-engine'

const getBusinessDetails = {
  method: 'GET',
  path: '/business/{sbi}/details',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { sbi } = params

    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi').takeover()
    }

    // Persist the SBI so change journeys (e.g. /business-email-change) can
    // resolve the business without an SBI in their URL
    yar.set('businessDetailsUpdate', { sbi })

    const email = auth.credentials?.email
    const businessDetails = await fetchBusinessDetailsService(sbi, email)
    const pageData = businessDetailsPresenter(businessDetails, sbi)

    return h.view('business/business-details', pageData)
  }
}

export const businessDetailsRoutes = [
  getBusinessDetails
]
