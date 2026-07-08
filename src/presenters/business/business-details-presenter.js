/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'

const CHANGE_LINK = '#'

const businessDetailsPresenter = (data, sbi) => {
  const { info, address, contact } = data
  const countyParishHoldingNumbers = presenters.formatCph(info.countyParishHoldingNumbers)
  const addressLines = presenters.formatBusinessAddress(address)
  const hasAddress = addressLines.length > 0

  return {
    pageTitle: 'View and update your business details',
    metaDescription: 'View and update your business details.',
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
      action: presenters.getActionText(hasAddress),
      changeLink: CHANGE_LINK
    },
    businessTelephone: createEditableTelephoneField(contact.landline, contact.mobile),
    businessEmail: createEditableValueField(contact.email, 'Not added'),
    vatNumber: createEditableValueField(info.vat, 'No number added'),
    tradeNumber: info.traderNumber ?? null,
    vendorRegistrationNumber: info.vendorNumber ?? null,
    countyParishHoldingNumbers,
    countyParishHoldingNumbersText: presenters.formatCphText(countyParishHoldingNumbers.length),
    businessLegalStatus: createEditableValueField(info.legalStatus, 'Not added'),
    businessType: createEditableValueField(info.type, 'Not added')
  }
}

const createEditableValueField = (value, emptyValueText) => {
  return {
    value: value || emptyValueText,
    action: presenters.getActionText(value),
    changeLink: CHANGE_LINK
  }
}

const createEditableTelephoneField = (landline, mobile) => {
  const hasTelephone = Boolean(landline || mobile)

  return {
    telephone: landline || 'Not added',
    mobile: mobile || 'Not added',
    action: presenters.getActionText(hasTelephone),
    changeLink: CHANGE_LINK
  }
}

const formatOverviewBreadcrumb = (businessName, sbi) => {
  return businessName ? `${businessName} (SBI: ${sbi})` : `SBI: ${sbi}`
}

export {
  businessDetailsPresenter
}
