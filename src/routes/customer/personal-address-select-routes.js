import { utils, constants, schemas } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { personalAddressSelectPresenter } from '../../presenters/personal/personal-address-select-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalAddressSelect = {
  method: 'GET',
  path: '/customer/{crn}/account-address-select',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, ['changePersonalPostcode', 'changePersonalAddresses', 'changePersonalAddress'])

    if (!personalDetails.changePersonalPostcode || !personalDetails.changePersonalAddresses) {
      return h.redirect(`/customer/${crn}/account-address-change`)
    }

    const pageData = personalAddressSelectPresenter(personalDetails)

    return h.view('personal/personal-address-select', pageData)
  }
}

const postPersonalAddressSelect = {
  method: 'POST',
  path: '/customer/{crn}/account-address-select',
  options: {
    pre: [validateCrn],
    validate: {
      payload: schemas.osPlaces.addresses,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth, params } = request
        const { crn } = params
        const email = auth.credentials?.email

        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, ['changePersonalPostcode', 'changePersonalAddresses'])
        const pageData = personalAddressSelectPresenter(personalDetails)

        return h.view('personal/personal-address-select', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { yar, auth, params, payload } = request
      const { crn } = params
      const email = auth.credentials?.email

      const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddresses')

      const selectedAddress = (personalDetails.changePersonalAddresses ?? []).find((address) => {
        // Concatenate UPRN and displayAddress to create a unique identifier.
        // Multiple addresses can share the same UPRN (e.g., multiple units in a building),
        // so UPRN alone is not unique. Using both properties ensures each address is truly distinct.
        return `${address.uprn}${address.displayAddress}` === payload.addresses
      })

      if (!selectedAddress) {
        return h.redirect(`/customer/${crn}/account-address-select`).takeover()
      }

      selectedAddress.postcodeLookup = true

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalAddress', selectedAddress)

      return h.redirect(`/customer/${crn}/account-address-check`)
    }
  }
}

export const personalAddressSelectRoutes = [
  getPersonalAddressSelect,
  postPersonalAddressSelect
]
