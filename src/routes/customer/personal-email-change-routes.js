import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { personalEmailChangePresenter } from '../../presenters/personal/personal-email-change-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getPersonalEmailChange = {
  method: 'GET',
  path: '/customer/{crn}/account-email-change',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalEmail')
    const pageData = personalEmailChangePresenter(personalDetails, undefined, crn)

    return h.view('personal/personal-email-change', pageData)
  }
}

const postPersonalEmailChange = {
  method: 'POST',
  path: '/customer/{crn}/account-email-change',
  options: {
    validate: {
      payload: schemas.personal.email,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, auth, yar, payload } = request
        const { crn } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalEmail')
        const pageData = personalEmailChangePresenter(personalDetails, payload.personalEmail, crn)

        return h.view('personal/personal-email-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { params, yar, payload } = request
      const { crn } = params

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalEmail', payload.personalEmail)

      return h.redirect(`/customer/${crn}/account-email-check`)
    }
  }
}

export const personalEmailChangeRoutes = [
  getPersonalEmailChange,
  postPersonalEmailChange
]
