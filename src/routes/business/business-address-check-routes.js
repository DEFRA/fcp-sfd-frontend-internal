import { schemas } from '@defra/fcp-sfd-frontend-engine'
import { businessAddressCheckPresenter } from '../../presenters/business/business-address-check-presenter.js'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessAddressChangeService } from '../../services/business/update-business-address-change-service.js'

const getBusinessAddressCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-address-check',
  handler: async (request, h) => {
    const { yar, auth, params, info } = request
    const { sbi } = params

    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi')
    }

    const email = auth.credentials?.email
    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')
    const pageData = businessAddressCheckPresenter(businessDetails, info.referrer)

    return h.view('business/business-address-check', pageData)
  }
}

const postBusinessAddressCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-address-check',
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { sbi } = params

    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi')
    }

    await updateBusinessAddressChangeService(yar, sbi, auth.credentials?.email)

    return h.redirect(`/business/${sbi}/business`)
  }
}

export const businessAddressCheckRoutes = [
  getBusinessAddressCheck,
  postBusinessAddressCheck
]
