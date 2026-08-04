/**
 * Updates the business address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual business details record.
 *
 * @module updateBusinessAddressChangeService
 */

import { mutations, services } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updateBusinessAddressChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessChangeService(yar, credentials, 'changeBusinessAddress')

  if (!businessDetails.changeBusinessAddress) {
    return
  }

  const variables = businessAddressVariables(businessDetails)

  await updateDalService(mutations.updateBusinessAddress, variables, credentials.email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your business address')
}

/**
 * Prepares the address details needed to update a business address.
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
 * For manual addresses, the mapping into the DAL address shape is delegated to
 * `services.buildManualAddress(change)` (from `@defra/fcp-sfd-frontend-engine`).
 *
 * The business address is wrapped with either `withUprn` or `withoutUprn`
 * depending on whether the address was selected via postcode lookup or entered manually.
 *
 * Optional fields are normalized so that any `undefined` values are
 * converted to `null` before being sent to the DAL.
 *
 * @param {Object} businessDetails - The business details object containing the address change
 * @returns {Object} Variables object formatted for the DAL mutation
 * @private
 */
const businessAddressVariables = (businessDetails) => {
  const change = businessDetails.changeBusinessAddress
  const sbi = businessDetails.info?.sbi

  // Base structure for the GraphQL mutation: includes the SBI (required for the mutation)
  // and sets up an empty address object that will be populated by the builder functions
  const baseVariables = {
    input: {
      sbi,
      address: {}
    }
  }

  // Business address uses withUprn/withoutUprn wrapper structure
  if (change.uprn) {
    baseVariables.input.address.withUprn = services.buildUprnAddress(change)
  } else {
    baseVariables.input.address.withoutUprn = services.buildManualAddress(change)
  }

  return baseVariables
}

export {
  updateBusinessAddressChangeService
}
