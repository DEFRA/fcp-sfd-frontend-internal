import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { personalPhoneNumbersChangePresenter } from '../../presenters/personal/personal-phone-numbers-change-presenter.js'
import { fetchPersonalChangeService } from '../../services/personal/fetch-personal-change-service.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateCrn } from '../pre-handlers.js'

const getPersonalPhoneNumbersChange = {
  method: 'GET',
  path: '/customer/{crn}/account-phone-numbers-change',
  options: {
    pre: [validateCrn]
  },
  handler: async (request, h) => {
    const { params, auth, yar } = request
    const { crn } = params

    const email = auth.credentials?.email
    const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPhoneNumbers')
    const pageData = personalPhoneNumbersChangePresenter(personalDetails, undefined, crn)

    return h.view('personal/personal-phone-numbers-change', pageData)
  }
}

const postPersonalPhoneNumbersChange = {
  method: 'POST',
  path: '/customer/{crn}/account-phone-numbers-change',
  options: {
    pre: [validateCrn],
    validate: {
      payload: schemas.personal.phone,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, auth, yar, payload } = request
        const { crn } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPhoneNumbers')
        const pageData = personalPhoneNumbersChangePresenter(personalDetails, payload, crn)

        return h.view('personal/personal-phone-numbers-change', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { params, yar, payload } = request
      const { crn } = params

      const phoneNumbers = {
        personalTelephone: payload.personalTelephone ?? null,
        personalMobile: payload.personalMobile ?? null
      }

      setSessionData(yar, 'personalDetailsUpdate', 'changePersonalPhoneNumbers', phoneNumbers)

      return h.redirect(`/customer/${crn}/account-phone-numbers-check`)
    }
  }
}

export const personalPhoneNumbersChangeRoutes = [
  getPersonalPhoneNumbersChange,
  postPersonalPhoneNumbersChange
]
