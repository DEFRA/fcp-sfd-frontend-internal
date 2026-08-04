/**
 * Prepares page data for the business address change page when there are validation
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
 * @module businessAddressChangeErrorService
 */

import { utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { businessAddressChangePresenter } from '../../presenters/business/business-address-change-presenter.js'

const businessAddressChangeErrorService = async (yar, credentials, postcode, error = []) => {
  const errors = utils.formatValidationErrors(error)
  const businessDetails = await fetchBusinessChangeService(yar, credentials, 'changeBusinessPostcode')
  const pageData = businessAddressChangePresenter(businessDetails, postcode)

  return {
    ...pageData,
    errors
  }
}

export {
  businessAddressChangeErrorService
}
