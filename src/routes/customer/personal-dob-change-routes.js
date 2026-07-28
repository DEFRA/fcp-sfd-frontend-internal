import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { personalDobChangePresenter } from '../../presenters/personal/personal-dob-change-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getPersonalDobChange = {
  method: 'GET',
  path: '/customer/{crn}/account-date-of-birth-change',
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const { error } = schemas.customer.crn.validate({ crn })

    if (error) {
      return h.redirect('/search-crn')
    }

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalDob')
    const pageData = personalDobChangePresenter(personalDetails, undefined, crn)

    return h.view('personal/personal-dob-change', pageData)
  }
}

const postPersonalDobChange = {
  method: 'POST',
  path: '/customer/{crn}/account-date-of-birth-change',
  options: {
    validate: {
      payload: schemas.personal.dob,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, auth, yar, payload } = request
        const { crn } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalDob')
        const pageData = personalDobChangePresenter(personalDetails, payload, crn)

        return h.view('personal/personal-dob-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { params, yar, payload } = request
      const { crn } = params

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalDob', payload)

      return h.redirect(`/customer/${crn}/account-date-of-birth-check`)
    }
  }
}

export const personalDobChangeRoutes = [
  getPersonalDobChange,
  postPersonalDobChange
]
