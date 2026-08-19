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

import { mutations } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updateBusinessVatRemoveService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(credentials)
  const variables = { input: { vat: '', sbi: businessDetails.info.sbi } }

  await updateDalService(mutations.updateBusinessVat, variables, credentials.sessionId)

  flashNotification(yar, 'Success', constants.successMessages.BUSINESS_VAT_REMOVE)
}

export {
  updateBusinessVatRemoveService
}
