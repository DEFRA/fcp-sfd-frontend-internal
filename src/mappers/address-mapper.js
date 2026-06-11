/**
 * Maps a raw address object to a structured address format
 *
 * @param {Object} address - The raw address data
 * @param {Object} [extraLookupFields={}] - Additional lookup fields to include (e.g. pafOrganisationName)
 *
 * @returns {Object} Formatted address data
 */
export const mapAddress = (address, extraLookupFields = {}) => ({
  lookup: {
    ...extraLookupFields,
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
})
