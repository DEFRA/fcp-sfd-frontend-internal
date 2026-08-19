/**
 * Service to update a business's VAT registration number
 *
 * Fetches the pending VAT change from the session
 * Calls the DAL to persist the updated VAT number using updateDalService
 * Clears the cached business details data from the session
 * Displays a success flash notification to the user
 *
 * @module updateBusinessVatChangeService
 */

import { mutations, utils, constants } from '@defra/fcp-sfd-frontend-engine'
import { updateDalService } from '../DAL/update-dal-service.js'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessVatChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessChangeService(yar, credentials, 'changeBusinessVat')

  if (!businessDetails.changeBusinessVat) {
    return
  }

  const variables = utils.buildUpdateBusinessVatVariables(businessDetails.changeBusinessVat, businessDetails.info.sbi)

  await updateDalService(mutations.updateBusinessVat, variables, credentials.email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_VAT)
}

export {
  updateBusinessVatChangeService
}
