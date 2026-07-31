import { schemas } from '@defra/fcp-sfd-frontend-engine'
import { personalAddressCheckPresenter } from '../../presenters/personal/personal-address-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalAddressChangeService } from '../../services/personal/update-personal-address-change-service.js'

const getPersonalAddressCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-address-check',
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')
    const pageData = personalAddressCheckPresenter(personalDetails)

    return h.view('personal/personal-address-check', pageData)
  }
}

const postPersonalAddressCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-address-check',
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    await updatePersonalAddressChangeService(yar, crn, auth.credentials?.email)

    return h.redirect(`/customer/${crn}/personal-details`)
  }
}

export const personalAddressCheckRoutes = [
  getPersonalAddressCheck,
  postPersonalAddressCheck
]
