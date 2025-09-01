import { fetchBusinessVatChangeService } from '../../services/business/fetch-business-vat-change-service.js'
import { updateBusinessVatChangeService } from '../../services/business/update-business-vat-change-service.js'
import { businessVatCheckPresenter } from '../../presenters/business/business-vat-check-presenter.js'

const getBusinessVatCheck = {
  method: 'GET',
  path: '/business-vat-check',
  handler: async (request, h) => {
    const businessVatChange = await fetchBusinessVatChangeService(request.yar, request.auth.credentials)
    const pageData = businessVatCheckPresenter(businessVatChange)

    return h.view('business/business-vat-check', pageData)
  }
}

const postBusinessVatCheck = {
  method: 'POST',
  path: '/business-vat-check',
  handler: async (request, h) => {
    await updateBusinessVatChangeService(request.yar, request.auth.credentials)

    return h.redirect('/business-details')
  }
}

export const businessVatCheckRoutes = [
  getBusinessVatCheck,
  postBusinessVatCheck
]
