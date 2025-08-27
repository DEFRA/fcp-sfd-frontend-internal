/**
 * Takes the raw data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted personal details data
 */

export const mapPersonalDetails = (value) => {
  return {
    crn: value.customer.crn,
    info: {
      dateOfBirth: value.customer.info.dateOfBirth,
      fullName: {
        title: value.customer.info.name.title,
        first: value.customer.info.name.first,
        last: value.customer.info.name.last,
        middle: value.customer.info.name.middle ?? null
      }
    },
    address: {
      lookup: {
        buildingNumberRange: value.customer.info.address.buildingNumberRange,
        flatName: value.customer.info.address.flatName,
        buildingName: value.customer.info.address.buildingName,
        street: value.customer.info.address.street,
        city: value.customer.info.address.city,
        county: value.customer.info.address.county
      },
      manual: {
        line1: value.customer.info.address.line1,
        line2: value.customer.info.address.line2,
        line3: value.customer.info.address.line3,
        line4: value.customer.info.address.line4,
        line5: value.customer.info.address.line5
      },
      postcode: value.customer.info.address.postalCode,
      country: value.customer.info.address.country
    },
    contact: {
      email: value.customer.info.email.address,
      telephone: value.customer.info.phone.landline,
      mobile: value.customer.info.phone.mobile
    }
  }
}
