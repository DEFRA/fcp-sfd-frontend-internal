import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessAddressChangeService } from '../../services/business/update-business-address-change-service.js'
import { businessAddressCheckPresenter } from '../../presenters/business/business-address-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessAddressCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-address-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { yar, auth } = request

    const businessAddressChange = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessAddress')
    const pageData = businessAddressCheckPresenter(businessAddressChange)

    return h.view('business/business-address-check', pageData)
  }
}

const postBusinessAddressCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-address-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params

    await updateBusinessAddressChangeService(yar, auth.credentials)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessAddressCheckRoutes = [
  getBusinessAddressCheck,
  postBusinessAddressCheck
]
