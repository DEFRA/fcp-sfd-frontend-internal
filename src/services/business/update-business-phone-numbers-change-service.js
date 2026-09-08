/**
 * Service to update a business' telephone numbers
 *
 * Fetches the pending business phone number(s) change from the session
 * Calls the DAL to persist the updated phone number(s) using updateDalService
 * Clears the cached business details from the session
 * Displays a success flash notification to the user
 */

import { mutations, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { updateDalService } from '../DAL/update-dal-service.js'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessPhoneNumbersChangeService = async (yar, sbi, email) => {
  const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessPhoneNumbers')

  if (!businessDetails.changeBusinessPhoneNumbers) {
    return
  }

  const { businessTelephone, businessMobile } = businessDetails.changeBusinessPhoneNumbers

  const variables = utils.buildUpdateBusinessPhoneNumbersVariables(businessTelephone, businessMobile, businessDetails.info.sbi)

  await updateDalService(mutations.updateBusinessPhoneNumbers, variables, email)

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_PHONE_NUMBERS)
}

export {
  updateBusinessPhoneNumbersChangeService
}
