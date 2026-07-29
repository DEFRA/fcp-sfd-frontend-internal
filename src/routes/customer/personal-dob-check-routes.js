import { personalDobCheckPresenter } from '../../presenters/personal/personal-dob-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalDobChangeService } from '../../services/personal/update-personal-dob-change-service.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalDobCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-date-of-birth-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalDob')
    const pageData = personalDobCheckPresenter(personalDetails, crn)

    return h.view('personal/personal-dob-check', pageData)
  }
}

const postPersonalDobCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-date-of-birth-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    await updatePersonalDobChangeService(yar, crn, email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalDobCheckRoutes = [
  getPersonalDobCheck,
  postPersonalDobCheck
]
