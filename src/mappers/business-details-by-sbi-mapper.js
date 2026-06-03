/**
 * Takes the raw business details by sbi data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

export const mapBusinessDetailsBySbi = (value) => {
  const address = value?.business?.info?.address ?? {}
  const info = value?.business?.info ?? {}

  return {
    info: {
      sbi: value.business.sbi,
      businessName: info.name,
      traderNumber: info.traderNumber,
      vendorNumber: info.vendorNumber
    },
    address: {
      lookup: {
        pafOrganisationName: address.pafOrganisationName,
        buildingNumberRange: address.buildingNumberRange,
        flatName: address.flatName,
        buildingName: address.buildingName,
        dependentLocality: address.dependentLocality,
        doubleDependentLocality: address.doubleDependentLocality,
        street: address.street,
        county: address.county,
        uprn: address.uprn
      },
      manual: {
        line1: address.line1,
        line2: address.line2,
        line3: address.line3,
        line4: address.line4,
        line5: address.line5
      },
      city: address.city,
      postcode: address.postalCode,
      country: address.country
    }
  }
}
