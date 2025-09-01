/**
 * Updates the business name change data
 * @module updateBusinessNameChangeService
 */

import { dalConnector } from '../../dal/connector.js'
import { updateBusinessNameMutation } from '../../dal/mutations/update-business-name.js'
import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessNameChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  const variables = { input: { name: businessDetails.changeBusinessName, sbi: businessDetails.info.sbi } }

  const response = await dalConnector(updateBusinessNameMutation, variables)

  if (response.errors) {
    throw new Error('DAL error from mutation')
  }

  businessDetails.info.businessName = businessDetails.changeBusinessName
  delete businessDetails.changeBusinessName

  yar.set('businessDetails', businessDetails)

  flashNotification(yar, 'Success', 'You have updated your business name')
}

export {
  updateBusinessNameChangeService
}
