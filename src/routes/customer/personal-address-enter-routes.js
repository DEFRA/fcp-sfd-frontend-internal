import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { personalAddressEnterPresenter } from '../../presenters/personal/personal-address-enter-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getPersonalAddressEnter = {
  method: 'GET',
  path: '/customer/{crn}/account-address-enter',
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email

    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')
    const pageData = personalAddressEnterPresenter(personalDetails)

    return h.view('personal/personal-address-enter', pageData)
  }
}

const postPersonalAddressEnter = {
  method: 'POST',
  path: '/customer/{crn}/account-address-enter',
  options: {
    validate: {
      payload: schemas.personal.address,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, yar, auth, payload } = request
        const { crn } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')
        const pageData = personalAddressEnterPresenter(personalDetails, payload, request.info.referrer)

        return h.view('personal/personal-address-enter', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: (request, h) => {
      const { params, yar, payload } = request
      const { crn } = params

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalAddress', payload)

      return h.redirect(`/customer/${crn}/account-address-check`)
    }
  }
}

export const personalAddressEnterRoutes = [
  getPersonalAddressEnter,
  postPersonalAddressEnter
]
