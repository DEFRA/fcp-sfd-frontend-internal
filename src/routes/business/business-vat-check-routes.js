import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessVatChangeService } from '../../services/business/update-business-vat-change-service.js'
import { businessVatCheckPresenter } from '../../presenters/business/business-vat-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessVatCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-vat-registration-number-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params
    const email = auth.credentials?.email

    const businessVatChange = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
    const pageData = businessVatCheckPresenter(businessVatChange)

    return h.view('business/business-vat-registration-number-check', pageData)
  }
}

const postBusinessVatCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-vat-registration-number-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params
    const email = auth.credentials?.email

    await updateBusinessVatChangeService(yar, sbi, email)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessVatCheckRoutes = [
  getBusinessVatCheck,
  postBusinessVatCheck
]
