import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { personalAddressSelectPresenter } from '../../presenters/personal/personal-address-select-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getPersonalAddressSelect = {
  method: 'GET',
  path: '/customer/{crn}/account-address-select',
  handler: async (request, h) => {
    const { yar, auth } = request
    const personalDetails = await fetchPersonalChangeService(yar, auth.credentials, ['changePersonalPostcode', 'changePersonalAddresses', 'changePersonalAddress'])

    if (!personalDetails.changePersonalPostcode || !personalDetails.changePersonalAddresses) {
      return h.redirect('/personal-details')
    }

    const pageData = personalAddressSelectPresenter(personalDetails)

    return h.view('personal/personal-address-select', pageData)
  }
}

const postPersonalAddressSelect = {
  method: 'POST',
  path: '/customer/{crn}/account-address-select',
  options: {
    validate: {
      payload: schemas.osPlaces.addresses,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth } = request

        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, auth.credentials, ['changePersonalPostcode', 'changePersonalAddresses'])
        const pageData = personalAddressSelectPresenter(personalDetails)

        return h.view('personal/personal-address-select', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const personalDetails = await fetchPersonalChangeService(request.yar, request.auth.credentials, 'changePersonalAddresses')

      const selectedAddress = personalDetails.changePersonalAddresses.find((address) => {
        return `${address.uprn}${address.displayAddress}` === request.payload.addresses
      })

      selectedAddress.postcodeLookup = true

      setSessionData(request.yar, 'personalDetailsUpdate', 'changePersonalAddress', selectedAddress)

      return h.redirect(`/customer/${request.params.crn}/account-address-check`)
    }
  }
}

export const personalAddressSelectRoutes = [
  getPersonalAddressSelect,
  postPersonalAddressSelect
]
