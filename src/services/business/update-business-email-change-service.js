import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessEmailChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  businessDetails.contact.email = businessDetails.changeBusinessEmail
  delete businessDetails.changeBusinessEmail

  yar.set('businessDetails', businessDetails)

  flashNotification(yar, 'Success', 'You have updated your business email address')
}

export {
  updateBusinessEmailChangeService
}
