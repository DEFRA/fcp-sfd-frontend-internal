import { personalNameCheckPresenter } from '../../presenters/personal/personal-name-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalNameChangeService } from '../../services/personal/update-personal-name-change-service.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalNameCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-name-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalName')
    const pageData = personalNameCheckPresenter(personalDetails, crn)

    return h.view('personal/personal-name-check', pageData)
  }
}

const postPersonalNameCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-name-check',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    await updatePersonalNameChangeService(yar, crn, email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalNameCheckRoutes = [
  getPersonalNameCheck,
  postPersonalNameCheck
]
