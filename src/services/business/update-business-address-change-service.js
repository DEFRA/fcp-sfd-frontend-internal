/**
 * Updates the business address details through the DAL service.
 *
 * This service commits the pending address change stored in the user's session
 * to their actual business details record.
 *
 * @module updateBusinessAddressChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updateBusinessAddressChangeService = async (yar, sbi, email) => {
  const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')

  if (!businessDetails.changeBusinessAddress) {
    return
  }

  const variables = utils.buildUpdateBusinessAddressVariables(businessDetails.changeBusinessAddress, businessDetails.sbi)

  await updateDalService(mutations.updateBusinessAddress, variables, email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_ADDRESS)
}

export {
  updateBusinessAddressChangeService
}
