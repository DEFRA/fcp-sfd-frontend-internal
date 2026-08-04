import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessAddressSelectPresenter } from '../../presenters/business/business-address-select-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessAddressSelect = {
  method: 'GET',
  path: '/business/{sbi}/business-address-select',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { sbi } = params

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, ['changeBusinessPostcode', 'changeBusinessAddresses', 'changeBusinessAddress'])

    if (!businessDetails.changeBusinessPostcode || !businessDetails.changeBusinessAddresses) {
      return h.redirect(`/business/${sbi}/address-change`)
    }

    const pageData = businessAddressSelectPresenter(businessDetails)

    return h.view('business/business-address-select', pageData)
  }
}

const postBusinessAddressSelect = {
  method: 'POST',
  path: '/business/{sbi}/business-address-select',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.osPlaces.addresses,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, ['changeBusinessPostcode', 'changeBusinessAddresses'])
        const pageData = businessAddressSelectPresenter(businessDetails)

        return h.view('business/business-address-select', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { yar, auth, params, payload } = request
    const { sbi } = params

    const businessDetails = await fetchBusinessChangeService(yar, auth.credentials, 'changeBusinessAddresses')

    const selectedAddress = (businessDetails.changeBusinessAddresses ?? []).find((address) => {
      // Concatenate UPRN and displayAddress to create a unique identifier.
      // Multiple addresses can share the same UPRN (e.g., multiple units in a building),
      // so UPRN alone is not unique. Using both properties ensures each address is truly distinct.
      return `${address.uprn}${address.displayAddress}` === payload.addresses
    })

    if (!selectedAddress) {
      return h.redirect(`/business/${sbi}/business-address-select`).takeover()
    }

    selectedAddress.postcodeLookup = true

    setSessionData(yar, 'businessDetailsUpdate', 'changeBusinessAddress', selectedAddress)

    return h.redirect(`/business/${sbi}/business-address-check`)
  }
}

export const businessAddressSelectRoutes = [
  getBusinessAddressSelect,
  postBusinessAddressSelect
]
