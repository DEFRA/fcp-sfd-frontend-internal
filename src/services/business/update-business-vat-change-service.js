import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessVatChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  businessDetails.info.vat = businessDetails.changeBusinessVat
  delete businessDetails.changeBusinessVat

  yar.set('businessDetails', businessDetails)
  flashNotification(yar, 'Success', 'You have updated your business VAT number')
}

export {
  updateBusinessVatChangeService
}
