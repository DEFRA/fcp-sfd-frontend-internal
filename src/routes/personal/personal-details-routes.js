import { fetchPersonalDetailsService } from '../../services/personal/fetch-personal-details-service.js'
import { personalDetailsPresenter } from '../../presenters/personal/personal-details-presenter.js'

const getPersonalDetails = {
  method: 'GET',
  path: '/personal-details',
  handler: async (request, h) => {
    const { yar, auth } = request
    const personalDetails = await fetchPersonalDetailsService(yar, auth.credentials)
    const pageData = personalDetailsPresenter(personalDetails, request.yar)

    return h.view('personal/personal-details.njk', pageData)
  }
}

export const personalDetailsRoutes = [
  getPersonalDetails
]
