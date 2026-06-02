/**
 * Takes the raw business details by sbi data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

export const mapBusinessDetailsBySbi = (value) => {
  return {
    info: {
      sbi: value.business.sbi,
      businessName: value.business.info.name,
      traderNumber: value.business.info.traderNumber,
      vendorNumber: value.business.info.vendorNumber
    },
    address: {
      lookup: {
        pafOrganisationName: value.business.info.address.pafOrganisationName,
        buildingNumberRange: value.business.info.address.buildingNumberRange,
        flatName: value.business.info.address.flatName,
        buildingName: value.business.info.address.buildingName,
        dependentLocality: value.business.info.address.dependentLocality,
        doubleDependentLocality: value.business.info.address.doubleDependentLocality,
        street: value.business.info.address.street,
        county: value.business.info.address.county,
        uprn: value.business.info.address.uprn
      },
      manual: {
        line1: value.business.info.address.line1,
        line2: value.business.info.address.line2,
        line3: value.business.info.address.line3,
        line4: value.business.info.address.line4,
        line5: value.business.info.address.line5
      },
      city: value.business.info.address.city,
      postcode: value.business.info.address.postalCode,
      country: value.business.info.address.country
    }
  }
}
