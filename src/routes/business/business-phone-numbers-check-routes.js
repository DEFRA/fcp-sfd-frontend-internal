import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessPhoneNumbersChangeService } from '../../services/business/update-business-phone-numbers-change-service.js'
import { businessPhoneNumbersCheckPresenter } from '../../presenters/business/business-phone-numbers-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessPhoneNumbersCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-phone-numbers-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    yar.set('businessDetailsUpdate', { ...yar.get('businessDetailsUpdate'), sbi })

    const businessPhoneNumbersChange = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessPhoneNumbers')
    const pageData = businessPhoneNumbersCheckPresenter(businessPhoneNumbersChange)

    return h.view('business/business-phone-numbers-check', pageData)
  }
}

const postBusinessPhoneNumbersCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-phone-numbers-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    await updateBusinessPhoneNumbersChangeService(yar, auth.credentials)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessPhoneNumbersCheckRoutes = [
  getBusinessPhoneNumbersCheck,
  postBusinessPhoneNumbersCheck
]
