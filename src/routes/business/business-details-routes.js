import { fetchBusinessDetailsService } from '../../services/business/fetch-business-details-service.js'
import { businessDetailsPresenter } from '../../presenters/business/business-details-presenter.js'
import { validateBusinessDetailsService } from '../../services/business/validate-business-details-service.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessDetails = {
  method: 'GET',
  path: '/business/{sbi}/details',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { sbi } = params

    // This is the journey entry point, so reset businessDetailsUpdate to { sbi }
    // to clear any stale in-progress edits, and clear any stale interrupter
    // validation session. Sub-pages (e.g. email-change) deliberately spread
    // existing session data instead, to preserve in-progress changes if the
    // user revisits or refreshes. Keep this reset as-is.
    yar.set('businessDetailsUpdate', { sbi })
    yar.clear('businessDetailsValidation')

    const email = auth.credentials?.email
    const businessDetails = await fetchBusinessDetailsService(sbi, email)
    const { hasValidBusinessDetails, sectionsNeedingUpdate } = validateBusinessDetailsService(businessDetails)

    if (!hasValidBusinessDetails) {
      yar.set('businessDetailsValidation', { businessDetailsValid: false, sectionsNeedingUpdate })
    }

    const pageData = businessDetailsPresenter(businessDetails, sbi, yar, hasValidBusinessDetails, sectionsNeedingUpdate)

    return h.view('business/business-details', pageData)
  }
}

export const businessDetailsRoutes = [
  getBusinessDetails
]
