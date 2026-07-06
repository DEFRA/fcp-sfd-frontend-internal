/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { formatDisplayAddress } from '../base-presenter.js'

const businessDetailsPresenter = (data, sbi) => {
  const countyParishHoldingNumbers = formatCph(data.info.countyParishHoldingNumbers)

  return {
    pageTitle: 'View business details',
    metaDescription: 'View business details.',
    sbi,
    breadcrumbs: [
      {
        text: 'Search results',
        href: `/search-sbi?sbi=${sbi}`
      },
      {
        text: formatOverviewBreadcrumb(data.info.businessName, sbi),
        href: `/business/${sbi}`
      }
    ],
    businessName: {
      value: data.info.businessName || 'Not added',
      action: getActionText(data.info.businessName),
      changeLink: '#'
    },
    businessAddress: {
      value: formatAddress(data.address),
      action: getActionText(data.address?.lookup?.uprn || data.address?.manual?.line1),
      changeLink: '#'
    },
    businessTelephone: {
      telephone: data.contact.landline || 'Not added',
      mobile: data.contact.mobile || 'Not added',
      action: getActionText(data.contact.landline || data.contact.mobile),
      changeLink: '#'
    },
    businessEmail: {
      value: data.contact.email || 'Not added',
      action: getActionText(data.contact.email),
      changeLink: '#'
    },
    vatNumber: {
      value: data.info.vat || 'No number added',
      action: getActionText(data.info.vat),
      changeLink: '#'
    },
    tradeNumber: data.info.traderNumber ?? null,
    vendorRegistrationNumber: data.info.vendorNumber ?? null,
    countyParishHoldingNumbers,
    countyParishHoldingNumbersText: `County Parish Holding (CPH) number${countyParishHoldingNumbers.length > 1 ? 's' : ''}`,
    businessLegalStatus: {
      value: data.info.legalStatus ?? 'Not added',
      action: getActionText(data.info.legalStatus),
      changeLink: '#'
    },
    businessType: {
      value: data.info.type ?? 'Not added',
      action: getActionText(data.info.type),
      changeLink: '#'
    }
  }
}

const formatAddress = (businessAddress) => {
  if (businessAddress?.lookup?.uprn || businessAddress?.manual?.line1) {
    return formatDisplayAddress(businessAddress)
  }

  return 'Not added'
}

const getActionText = (value) => {
  return value ? 'Change' : 'Add'
}

const formatOverviewBreadcrumb = (businessName, sbi) => {
  return businessName ? `${businessName} (SBI: ${sbi})` : `SBI: ${sbi}`
}

const formatCph = (countyParishHoldings) => {
  return (countyParishHoldings || [])
    .filter((cph) => cph?.cphNumber)
    .map((cph) => cph.cphNumber)
}

export {
  businessDetailsPresenter
}
