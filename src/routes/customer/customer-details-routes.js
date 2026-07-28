import { fetchPersonalDetailsService } from '../../services/fetch-personal-details-service.js'
import { personalDetailsPresenter } from '../../presenters/personal/personal-details-presenter.js'
import { validatePersonalDetailsService } from '../../services/personal/validate-personal-details-service.js'
import { validateCrn } from '../pre-handlers.js'

const getCustomerDetails = {
  method: 'GET',
  path: '/customer/{crn}/details',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    yar.clear('personalDetailsUpdate')

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
