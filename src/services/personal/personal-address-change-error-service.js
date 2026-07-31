/**
 * Prepares page data for the personal address change page when there are validation
 * or postcode lookup errors.
 *
 * This service is used when:
 *  1. Joi validation fails for the user's input.
 *  2. A postcode lookup returns no addresses for the entered postcode.
 *
 * By abstracting this logic into its own service it keeps the route handler focused on handling requests, while error
 * formatting and page data preparation are handled here.
 *
 * Normally Joi's `failAction` only handles validation errors, however postcode lookup failures are treated similarly,
 * so this service allows rendering the same page with appropriate errors.
 *
 * @module personalAddressChangeErrorService
 */

import { utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { personalAddressChangePresenter } from '../../presenters/personal/personal-address-change-presenter.js'

const personalAddressChangeErrorService = async (yar, crn, email, postcode, error = []) => {
  const errors = utils.formatValidationErrors(error)
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalPostcode')
  const pageData = personalAddressChangePresenter(personalDetails, postcode)

  return {
    ...pageData,
    errors
  }
}

export {
  personalAddressChangeErrorService
}
