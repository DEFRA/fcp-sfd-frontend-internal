import { schemas } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalDetailsService } from '../../services/fetch-personal-details-service.js'
import { personalDetailsPresenter } from '../../presenters/personal-details-presenter.js'
import { validatePersonalDetailsService } from '../../services/validate-personal-details-service.js'

const getCustomerDetails = {
  method: 'GET',
  path: '/customer/{crn}/details',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn').takeover()
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalDetailsService(crn, email)
    const { hasValidPersonalDetails, sectionsNeedingUpdate } = validatePersonalDetailsService(personalDetails)

    const pageData = personalDetailsPresenter(personalDetails, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

    return h.view('personal/personal-details.njk', pageData)
  }
}

export const customerDetailsRoutes = [
  getCustomerDetails
]
