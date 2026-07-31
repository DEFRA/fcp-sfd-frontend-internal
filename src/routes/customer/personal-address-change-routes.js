import { constants, schemas } from '@defra/fcp-sfd-frontend-engine'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { personalAddressChangePresenter } from '../../presenters/personal/personal-address-change-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { addressLookupService } from '../../services/os-places/address-lookup-service.js'
import { personalAddressChangeErrorService } from '../../services/personal/personal-address-change-error-service.js'

const getPersonalAddressChange = {
  method: 'GET',
  path: '/customer/{crn}/account-address-change',
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPostcode')
    const pageData = personalAddressChangePresenter(personalDetails)

    return h.view('personal/personal-address-change', pageData)
  }
}

const postPersonalAddressChange = {
  method: 'POST',
  path: '/customer/{crn}/account-address-change',
  options: {
    validate: {
      payload: schemas.osPlaces.ukPostcode,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth, payload, params } = request
        const { crn } = params
        const email = auth.credentials?.email
        const pageData = await personalAddressChangeErrorService(yar, crn, email, payload.postcode, err.details)

        return h.view('personal/personal-address-change', pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { yar, auth, payload, params } = request
    const { crn } = params
    const email = auth.credentials?.email

    setSessionData(yar, 'personalDetailsUpdate', 'changePersonalPostcode', payload)
    const addresses = await addressLookupService(payload.postcode, yar, 'personal')

    if (addresses.error) {
      const pageData = await personalAddressChangeErrorService(yar, crn, email, payload.postcode, addresses.error)

      return h.view('personal/personal-address-change', pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
    }

    return h.redirect(`/customer/${crn}/account-address-select`)
  }
}

export const personalAddressChangeRoutes = [
  getPersonalAddressChange,
  postPersonalAddressChange
]
