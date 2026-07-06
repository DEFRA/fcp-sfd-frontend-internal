/**
 * Takes the raw business data from the DAL and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business details data
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

const asNullable = (value) => value ?? null

const mapBusinessInfo = (business) => {
  const info = business.info ?? {}

  return {
    sbi: business.sbi,
    businessName: asNullable(info.name),
    vat: asNullable(info.vat),
    traderNumber: asNullable(info.traderNumber),
    vendorNumber: asNullable(info.vendorNumber),
    legalStatus: asNullable(info.legalStatus?.type),
    type: asNullable(info.type?.type),
    countyParishHoldingNumbers: business.countyParishHoldings ?? []
  }
}

const mapBusinessContact = (businessInfo) => {
  return {
    email: asNullable(businessInfo.email?.address),
    landline: asNullable(businessInfo.phone?.landline),
    mobile: asNullable(businessInfo.phone?.mobile)
  }
}

export const mapBusinessDetails = (value) => {
  const business = value.business
  const businessInfo = business.info ?? {}

  return {
    info: mapBusinessInfo(business),
    address: mappers.address(businessInfo.address),
    contact: mapBusinessContact(businessInfo)
  }
}
