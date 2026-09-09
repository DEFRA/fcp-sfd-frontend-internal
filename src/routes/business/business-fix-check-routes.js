import { businessFixCheckPresenter } from '../../presenters/business/business-fix-check-presenter.js'
import { fetchBusinessFixService } from '../../services/business/fetch-business-fix-service.js'
import { updateBusinessFixService } from '../../services/business/update-business-fix-service.js'
import { BUSINESS_DETAILS_VALIDATION_JOURNEY } from '../../constants/journeys.js'
import { checkSbiAndInterrupterJourney } from '../pre-handlers.js'

const getBusinessFixCheck = {
  method: 'GET',
  path: '/business/{sbi}/details/fix-check',
  options: {
    pre: [checkSbiAndInterrupterJourney(BUSINESS_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    const sessionData = yar.get('businessDetailsValidation')
    const businessDetails = await fetchBusinessFixService(sbi, auth.credentials?.email, sessionData)
    const pageData = businessFixCheckPresenter(businessDetails, sbi)

    return h.view('business/business-fix-check.njk', pageData)
  }
}

const postBusinessFixCheck = {
  method: 'POST',
  path: '/business/{sbi}/details/fix-check',
  options: {
    pre: [checkSbiAndInterrupterJourney(BUSINESS_DETAILS_VALIDATION_JOURNEY)]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    const sessionData = yar.get('businessDetailsValidation')
    await updateBusinessFixService(sbi, sessionData, yar, auth.credentials?.email)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessFixCheckRoutes = [
  getBusinessFixCheck,
  postBusinessFixCheck
]
