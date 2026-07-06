/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { formatDisplayAddress } from '../base-presenter.js'

const CHANGE_LINK = '#'

const businessDetailsPresenter = (data, sbi) => {
  const { info, address, contact } = data
  const countyParishHoldingNumbers = formatCph(info.countyParishHoldingNumbers)
  const addressLines = formatAddress(address)
  const hasAddress = addressLines.length > 0

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
    businessName: createEditableValueField(info.businessName, 'Not added'),
    businessAddress: {
      value: hasAddress ? addressLines : 'Not added',
      action: getActionText(hasAddress),
      changeLink: CHANGE_LINK
    },
    businessTelephone: createEditableTelephoneField(contact.landline, contact.mobile),
    businessEmail: createEditableValueField(contact.email, 'Not added'),
    vatNumber: createEditableValueField(info.vat, 'No number added'),
    tradeNumber: info.traderNumber ?? null,
    vendorRegistrationNumber: info.vendorNumber ?? null,
    countyParishHoldingNumbers,
    countyParishHoldingNumbersText: `County Parish Holding (CPH) number${countyParishHoldingNumbers.length > 1 ? 's' : ''}`,
    businessLegalStatus: createEditableValueField(info.legalStatus, 'Not added'),
    businessType: createEditableValueField(info.type, 'Not added')
  }
}

const formatAddress = (businessAddress) => {
  if (businessAddress?.lookup?.uprn || businessAddress?.manual?.line1) {
    return formatDisplayAddress(businessAddress)
  }

  return []
}

const createEditableValueField = (value, emptyValueText) => {
  return {
    value: value || emptyValueText,
    action: getActionText(value),
    changeLink: CHANGE_LINK
  }
}

const createEditableTelephoneField = (landline, mobile) => {
  const hasTelephone = Boolean(landline || mobile)

  return {
    telephone: landline || 'Not added',
    mobile: mobile || 'Not added',
    action: getActionText(hasTelephone),
    changeLink: CHANGE_LINK
  }
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
