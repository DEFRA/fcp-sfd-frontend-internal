/**
 * Takes the raw customer details by CRN data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted customer details data
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

export const mapCustomerDetailsByCrn = (value) => {
  const info = value?.customer?.info ?? {}
  const name = info?.name ?? {}
  const address = info?.address ?? {}

  return {
    info: {
      crn: value.customer.crn,
      customerName: `${name.first} ${name.last}`
    },
    address: mappers.address(address)
  }
}
