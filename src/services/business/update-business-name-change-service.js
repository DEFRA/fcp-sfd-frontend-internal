/**
 * Service to update a business's name
 *
 * Fetches the pending business name change from the session
 * Calls the DAL to persist the updated name using updateDalService
 * Clears the cached business details data from the session
 * Displays a success flash notification to the user
 *
 * @module updateBusinessNameChangeService
 */

import { constants, mutations, utils } from '@defra/fcp-sfd-frontend-engine'

import { updateDalService } from '../DAL/update-dal-service.js'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessNameChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessChangeService(yar, credentials, 'changeBusinessName')

  if (!businessDetails.changeBusinessName) {
    return
  }

  const variables = utils.buildUpdateBusinessNameVariables(businessDetails.changeBusinessName, businessDetails.info.sbi)

  await updateDalService(mutations.updateBusinessName, variables, credentials.email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_NAME)
}

export {
  updateBusinessNameChangeService
}
