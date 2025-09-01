import { fetchBusinessDetailsService } from './fetch-business-details-service.js'

const fetchBusinessAddressChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessDetailsService(yar, credentials)

  let changeBusinessAddress = businessDetails?.changeBusinessAddress

  if (!businessDetails.changeBusinessAddress) {
    changeBusinessAddress = {
      address1: businessDetails.address.manual.line1,
      address2: businessDetails.address.manual.line2,
      city: businessDetails.address.manual.line4,
      county: businessDetails.address.manual.line5,
      postcode: businessDetails.address.postcode,
      country: businessDetails.address.country
    }
  }

  const updatedBusinessDetails = { ...businessDetails, changeBusinessAddress }
  yar.set('businessDetails', updatedBusinessDetails)

  return updatedBusinessDetails
}

export {
  fetchBusinessAddressChangeService
}
