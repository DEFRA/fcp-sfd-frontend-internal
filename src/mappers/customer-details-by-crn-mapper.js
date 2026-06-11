import { mapAddress } from './address-mapper.js'

/**
 * Takes the raw customer details by CRN data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted customer details data
 */

export const mapCustomerDetailsByCrn = (value) => {
  const info = value?.customer?.info ?? {}
  const name = info?.name ?? {}
  const address = info?.address ?? {}

  return {
    info: {
      crn: value.customer.crn,
      customerName: `${name.first} ${name.last}`
    },
    address: mapAddress(address)
  }
}
