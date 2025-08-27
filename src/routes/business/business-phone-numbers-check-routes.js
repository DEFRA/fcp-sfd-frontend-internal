import { businessPhoneNumbersCheckPresenter } from '../../presenters/business/business-phone-numbers-check-presenter.js'
import { fetchBusinessPhoneNumbersChangeService } from '../../services/business/fetch-business-phone-numbers-change-service.js'
import { updateBusinessPhoneNumbersChangeService } from '../../services/business/update-business-phone-numbers-change-service.js'

const getBusinessPhoneNumbersCheck = {
  method: 'GET',
  path: '/business-phone-numbers-check',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessPhoneNumbersChangeService(yar, auth.credentials)
    const pageData = businessPhoneNumbersCheckPresenter(businessDetails)

    return h.view('business/business-phone-numbers-check', pageData)
  }
}

const postBusinessPhoneNumbersCheck = {
  method: 'POST',
  path: '/business-phone-numbers-check',
  handler: async (request, h) => {
    const { yar, auth } = request
    await updateBusinessPhoneNumbersChangeService(yar, auth.credentials)

    return h.redirect('/business-details')
  }
}

export const businessPhoneNumbersCheckRoutes = [
  getBusinessPhoneNumbersCheck,
  postBusinessPhoneNumbersCheck
]
