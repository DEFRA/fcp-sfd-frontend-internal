/**
 * Takes the raw customer details by CRN data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted customer details data
 */

export const mapCustomerDetailsByCrn = (value) => {
  const info = value?.customer?.info ?? {}
  const address = info?.address ?? {}

  return {
    info: {
      crn: value.customer.crn,
      customerName: `${info.name.first} ${info.name.last}`
    },
    address: {
      lookup: {
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
