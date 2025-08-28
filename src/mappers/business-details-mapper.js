/**
 * Takes the raw data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

export const mapBusinessDetails = (value) => {
  return {
    info: {
      sbi: value.business.sbi,
      businessName: value.business.info.name,
      vat: value.business.info.vat,
      traderNumber: value.business.info.traderNumber,
      vendorNumber: value.business.info.vendorNumber,
      legalStatus: value.business.info.legalStatus.type,
      type: value.business.info.type.type,
      countyParishHoldingNumbers: value.business.countyParishHoldings
    },
    address: {
      lookup: {
        buildingNumberRange: value.business.info.address.buildingNumberRange,
        flatName: value.business.info.address.flatName,
        buildingName: value.business.info.address.buildingName,
        street: value.business.info.address.street,
        city: value.business.info.address.city,
        county: value.business.info.address.county
      },
      manual: {
        line1: value.business.info.address.line1,
        line2: value.business.info.address.line2,
        line3: value.business.info.address.line3,
        line4: value.business.info.address.line4,
        line5: value.business.info.address.line5
      },
      postcode: value.business.info.address.postalCode,
      country: value.business.info.address.country
    },
    contact: {
      email: value.business.info.email.address,
      landline: value.business.info.phone.landline,
      mobile: value.business.info.phone.mobile
    },
    customer: {
      fullName: [
        value.customer.info.name.title,
        value.customer.info.name.first,
        value.customer.info.name.last
      ].filter(Boolean).join(' ')
    }
  }
}
