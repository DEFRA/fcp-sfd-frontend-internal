/**
 * Takes the raw business data from the DAL and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

export const mapBusinessDetails = (value) => {
  return {
    info: {
      sbi: value.business.sbi,
      businessName: value.business.info.name ?? null,
      vat: value.business.info.vat ?? null,
      traderNumber: value.business.info.traderNumber ?? null,
      vendorNumber: value.business.info.vendorNumber ?? null,
      legalStatus: value.business.info.legalStatus?.type ?? null,
      type: value.business.info.type?.type ?? null,
      countyParishHoldingNumbers: value.business.countyParishHoldings ?? []
    },
    address: mappers.address(value.business.info.address),
    contact: {
      email: value.business.info.email?.address ?? null,
      landline: value.business.info.phone?.landline ?? null,
      mobile: value.business.info.phone?.mobile ?? null
    }
  }
}
