/**
 * Maps the raw customer details by CRN data from the DAL to a more usable format
 *
 * @module customerDetailsByCrnMapper
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

/**
 * Maps the raw customer details by CRN data from the DAL to a more usable format
 *
 * @param {object} value - The data from the DAL
 *
 * @returns {object} Formatted customer details data
 */
export const mapCustomerDetailsByCrn = (value) => {
  const info = value?.customer?.info ?? {}
  const name = info?.name ?? {}
  const address = info?.address ?? {}

  return {
    crn: value.customer.crn,
    customerName: `${name.first} ${name.last}`,
    address: mappers.address(address)
  }
}
