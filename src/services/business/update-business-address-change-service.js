import { fetchBusinessDetailsService } from './fetch-business-details-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'

const updateBusinessAddressChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  mapPayloadToBusinessDetails(businessDetails.address, businessDetails.changeBusinessAddress)
  removeLookupAddress(businessDetails)
  delete businessDetails.changeBusinessAddress

  yar.set('businessDetails', businessDetails)

  flashNotification(yar, 'Success', 'You have updated your business address')
}

const removeLookupAddress = (businessDetails) => {
  Object.keys(businessDetails.address.lookup).forEach(key => {
    businessDetails.address.lookup[key] = null
  })
}

const mapPayloadToBusinessDetails = (address, changeBusinessAddress) => {
  // Only the option fields are guarded with a null check
  address.manual.line1 = changeBusinessAddress.address1
  address.manual.line2 = changeBusinessAddress.address2 ?? null
  address.manual.line4 = changeBusinessAddress.city
  address.manual.line5 = changeBusinessAddress.county ?? null
  address.postcode = changeBusinessAddress.postcode
  address.country = changeBusinessAddress.country
}

export {
  updateBusinessAddressChangeService
}
