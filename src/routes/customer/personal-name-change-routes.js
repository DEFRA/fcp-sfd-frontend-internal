import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { personalNameChangePresenter } from '../../presenters/personal/personal-name-change-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getPersonalNameChange = {
  method: 'GET',
  path: '/customer/{crn}/account-name-change',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalName')
    const pageData = personalNameChangePresenter(personalDetails, undefined, crn)

    return h.view('personal/personal-name-change', pageData)
  }
}

const postPersonalNameChange = {
  method: 'POST',
  path: '/customer/{crn}/account-name-change',
  options: {
    validate: {
      payload: schemas.personal.name,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, auth, yar, payload } = request
        const { crn } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalName')
        const pageData = personalNameChangePresenter(personalDetails, payload, crn)

        return h.view('personal/personal-name-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { params, yar, payload } = request
      const { crn } = params

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalName', payload)

      return h.redirect(`/customer/${crn}/account-name-check`)
    }
  }
}

export const personalNameChangeRoutes = [
  getPersonalNameChange,
  postPersonalNameChange
]
