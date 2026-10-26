/**
 * Maps the raw business details by SBI data from the DAL to a more usable format
 *
 * @module businessDetailsBySbiMapper
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

/**
 * Maps the raw business details by SBI data from the DAL to a more usable format
 *
 * @param {object} value - The data from the DAL
 *
 * @returns {object} Formatted business details data
 */
export const mapBusinessDetailsBySbi = (value) => {
  const address = value?.business?.info?.address ?? {}
  const info = value?.business?.info ?? {}

  return {
    sbi: value.business.sbi,
    businessName: info.name,
    traderNumber: info.traderNumber,
    vendorNumber: info.vendorNumber,
    address: mappers.address(address)
  }
}
