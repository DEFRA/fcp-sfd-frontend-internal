import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessEmailChangeService } from '../../services/business/update-business-email-change-service.js'
import { businessEmailCheckPresenter } from '../../presenters/business/business-email-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessEmailCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-email-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, info } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessEmailChange = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessEmail')
    const pageData = businessEmailCheckPresenter(businessEmailChange, info.referrer)

    return h.view('business/business-email-check', pageData)
  }
}

const postBusinessEmailCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-email-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    await updateBusinessEmailChangeService(yar, auth.credentials)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessEmailCheckRoutes = [
  getBusinessEmailCheck,
  postBusinessEmailCheck
]
