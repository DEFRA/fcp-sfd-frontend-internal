/**
 * Takes the raw business details by sbi data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

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
    address: mappers.address(address)
  }
}
