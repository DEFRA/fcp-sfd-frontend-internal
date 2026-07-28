import { schemas } from '@defra/fcp-sfd-frontend-engine'

import { personalPhoneNumbersCheckPresenter } from '../../presenters/personal/personal-phone-numbers-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalPhoneNumbersChangeService } from '../../services/personal/update-personal-phone-numbers-change-service.js'

const getPersonalPhoneNumbersCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-phone-numbers-check',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPhoneNumbers')
    const pageData = personalPhoneNumbersCheckPresenter(personalDetails, crn)

    return h.view('personal/personal-phone-numbers-check', pageData)
  }
}

const postPersonalPhoneNumbersCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-phone-numbers-check',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    await updatePersonalPhoneNumbersChangeService(yar, crn, email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalPhoneNumbersCheckRoutes = [
  getPersonalPhoneNumbersCheck,
  postPersonalPhoneNumbersCheck
]
