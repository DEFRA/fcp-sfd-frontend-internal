/**
 * Service to remove a business's VAT registration number
 *
 * Fetches the current business details
 * Calls the DAL to remove the VAT number using updateDalService
 * Displays a success flash notification to the user
 *
 * Note: This service does not clear or update session data because the
 * remove VAT page does not store any changed data in the session.
 *
 * @module updateBusinessVatRemoveService
 */

import { mutations, utils, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updateBusinessVatRemoveService = async (yar, sbi, email) => {
  const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessVat')
  const variables = utils.buildUpdateBusinessVatVariables('', businessDetails.info.sbi)

  await updateDalService(mutations.updateBusinessVat, variables, email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_VAT_REMOVE)
}

export {
  updateBusinessVatRemoveService
}
