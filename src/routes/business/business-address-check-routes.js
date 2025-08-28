import { businessAddressCheckPresenter } from '../../presenters/business/business-address-check-presenter.js'
import { fetchBusinessAddressChangeService } from '../../services/business/fetch-business-address-change-service.js'
import { updateBusinessAddressChangeService } from '../../services/business/update-business-address-change-service.js'

const getBusinessAddressCheck = {
  method: 'GET',
  path: '/business-address-check',
  handler: async (request, h) => {
    const { yar, auth } = request
    const businessDetails = await fetchBusinessAddressChangeService(yar, auth.credentials)
    const pageData = businessAddressCheckPresenter(businessDetails)

    return h.view('business/business-address-check', pageData)
  }
}

const postBusinessAddressCheck = {
  method: 'POST',
  path: '/business-address-check',
  handler: async (request, h) => {
    const { yar, auth } = request
    await updateBusinessAddressChangeService(yar, auth.credentials)

    return h.redirect('/business-details')
  }
}

export const businessAddressCheckRoutes = [
  getBusinessAddressCheck,
  postBusinessAddressCheck
]
