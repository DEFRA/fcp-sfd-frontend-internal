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

    // This is the journey entry point, so reset businessDetailsUpdate to { sbi }
    // to clear any stale in-progress edits. Sub-pages (e.g. business-email-change)
    // deliberately spread existing session data instead, to preserve in-progress
    // changes if the user revisits or refreshes. Keep this reset as-is.
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
