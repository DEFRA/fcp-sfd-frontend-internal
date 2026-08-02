/**
 * Updates the personal address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual personal details record.
 *
 * @module updatePersonalAddressChangeService
 */

import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalAddressChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalAddress')

  if (!personalDetails.changePersonalAddress) {
    return
  }

  const variables = personalAddressVariables(personalDetails)

  await updateDalService(mutations.updateCustomerAddress, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your personal address')
}

/**
 * Prepares the address details needed to update a personal address.
 *
 * The DAL/v1 supports two address submission modes:
 *
 * 1. Postcode lookup address (with UPRN)
 *    If a `uprn` (Unique Property Reference Number) is present, it is the
 *    primary identifier for the address. Other address fields are still
 *    included but are not strictly validated by the DAL.
 *
 * 2. Manually entered address (without UPRN)
 *    If there is no `uprn`, the DAL/v1 requires the following fields:
 *    - `line1`
 *    - `city`
 *    - `postalCode`
 *    - `country`
 *
 * For manual addresses, the address lines are mapped from the user input
 * into the DAL structure, with `county` stored in `line4`. The `city`
 * remains in the `city` field and `line5` is unused.
 *
 * Optional fields are normalized so that any `undefined` values are
 * converted to `null` before being sent to the DAL.
 *
 * @param {Object} personalDetails - The personal details object containing the address change
 * @returns {Object} Variables object formatted for the DAL mutation
 * @private
 */
const personalAddressVariables = (personalDetails) => {
  const change = personalDetails.changePersonalAddress

  // Base structure for the GraphQL mutation: includes the CRN (required for the mutation)
  // and sets up an empty address object that will be populated by the builder functions
  const baseVariables = {
    input: {
      crn: personalDetails.crn,
      address: {}
    }
  }

  baseVariables.input.address = change.uprn
    ? services.buildUprnAddress(change)
    : services.buildManualAddress(change)

  return baseVariables
}

export {
  updatePersonalAddressChangeService
}
