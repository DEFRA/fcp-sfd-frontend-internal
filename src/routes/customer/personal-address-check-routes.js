import { personalAddressCheckPresenter } from '../../presenters/personal/personal-address-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalAddressChangeService } from '../../services/personal/update-personal-address-change-service.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalAddressCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-address-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')
    const pageData = personalAddressCheckPresenter(personalDetails)

    return h.view('personal/personal-address-check', pageData)
  }
}

const postPersonalAddressCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-address-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    await updatePersonalAddressChangeService(yar, crn, auth.credentials?.email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalAddressCheckRoutes = [
  getPersonalAddressCheck,
  postPersonalAddressCheck
]
