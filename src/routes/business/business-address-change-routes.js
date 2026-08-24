import { constants, schemas } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessAddressChangePresenter } from '../../presenters/business/business-address-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { addressLookupService } from '../../services/os-places/address-lookup-service.js'
import { businessAddressChangeErrorService } from '../../services/business/business-address-change-error-service.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessAddressChange = {
  method: 'GET',
  path: '/business/{sbi}/business-address-change',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { sbi } = params
    const email = auth.credentials?.email

    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessPostcode')
    const pageData = businessAddressChangePresenter(businessDetails)

    return h.view('business/business-address-change', pageData)
  }
}

const postBusinessAddressChange = {
  method: 'POST',
  path: '/business/{sbi}/business-address-change',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.osPlaces.ukPostcode,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth, payload, params } = request
        const { sbi } = params
        const email = auth.credentials?.email

        const pageData = await businessAddressChangeErrorService(yar, sbi, email, payload.postcode, err.details)

        return h.view('business/business-address-change', pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { yar, auth, payload, params } = request
    const { sbi } = params
    const email = auth.credentials?.email

    setSessionData(yar, 'businessDetailsUpdate', 'changeBusinessPostcode', payload)
    const addresses = await addressLookupService(payload.postcode, yar, 'business')

    if (addresses.error) {
      const pageData = await businessAddressChangeErrorService(yar, sbi, email, payload.postcode, addresses.error)

      return h.view('business/business-address-change', pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
    }

    return h.redirect(`/business/${sbi}/business-address-select`)
  }
}

export const businessAddressChangeRoutes = [
  getBusinessAddressChange,
  postBusinessAddressChange
]
