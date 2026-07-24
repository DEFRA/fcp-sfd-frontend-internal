import { schemas } from '@defra/fcp-sfd-frontend-engine'

import { personalEmailCheckPresenter } from '../../presenters/personal/personal-email-check-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { updatePersonalEmailChangeService } from '../../services/personal/update-personal-email-change-service.js'

const getPersonalEmailCheck = {
  method: 'GET',
  path: '/customer/{crn}/account-email-check',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalEmail')
    const pageData = personalEmailCheckPresenter(personalDetails, crn)

    return h.view('personal/personal-email-check', pageData)
  }
}

const postPersonalEmailCheck = {
  method: 'POST',
  path: '/customer/{crn}/account-email-check',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    await updatePersonalEmailChangeService(yar, crn, email)

    return h.redirect(`/customer/${crn}/details`)
  }
}

export const personalEmailCheckRoutes = [
  getPersonalEmailCheck,
  postPersonalEmailCheck
]
