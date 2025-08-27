import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessPhoneNumbersChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  businessDetails.contact.landline = businessDetails.changeBusinessTelephone ?? null
  businessDetails.contact.mobile = businessDetails.changeBusinessMobile ?? null

  delete businessDetails.changeBusinessTelephone
  delete businessDetails.changeBusinessMobile

  yar.set('businessDetails', businessDetails)

  flashNotification(yar, 'Success', 'You have updated your business phone numbers')
}

export {
  updateBusinessPhoneNumbersChangeService
}
