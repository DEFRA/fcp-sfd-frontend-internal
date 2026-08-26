/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { formatBreadcrumbLabel } from '../base-presenter.js'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'

const CHANGE_LINK = '#'

const businessDetailsPresenter = (data, sbi, yar) => {
  const { info, address, contact } = data
  const countyParishHoldingNumbers = presenters.formatCph(info.countyParishHoldingNumbers)
  const addressLines = presenters.formatBusinessAddress(address)
  const hasAddress = addressLines.length > 0

  return {
    notification: yar ? yar.flash('notification')[0] : null,
    pageTitle: 'View and update your business details',
    metaDescription: 'View and update your business details.',
    sbi,
    breadcrumbs: buildBreadcrumbs(info.businessName, sbi),
    businessName: {
      value: info.businessName || 'Not added',
      action: presenters.getActionText(info.businessName),
      changeLink: BUSINESS_CHANGE_LINKS.businessName(sbi)
    },
    businessAddress: {
      value: hasAddress ? addressLines : 'Not added',
      action: presenters.getActionText(hasAddress),
      changeLink: BUSINESS_CHANGE_LINKS.businessAddress(sbi)
    },
    businessTelephone: {
      telephone: data.contact.landline || 'Not added',
      mobile: data.contact.mobile || 'Not added',
      action: presenters.getActionText(data.contact.landline || data.contact.mobile),
      changeLink: BUSINESS_CHANGE_LINKS.businessTelephone(sbi)
    },
    businessEmail: {
      value: contact.email || 'Not added',
      action: presenters.getActionText(contact.email),
      changeLink: BUSINESS_CHANGE_LINKS.businessEmail(sbi)
    },
    vatNumber: buildVatDisplay(info.vat, sbi),
    tradeNumber: info.traderNumber ?? null,
    vendorRegistrationNumber: info.vendorNumber ?? null,
    countyParishHoldingNumbers,
    countyParishHoldingNumbersText: presenters.formatCphText(countyParishHoldingNumbers.length),
    businessLegalStatus: {
      value: info.legalStatus || 'Not added',
      action: presenters.getActionText(info.legalStatus),
      changeLink: BUSINESS_CHANGE_LINKS.businessLegalStatus(sbi)
    },
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

const buildBreadcrumbs = (businessName, sbi) => {
  return [
    {
      text: 'Search results',
      href: `/search-sbi?sbi=${sbi}`
    },
    {
      text: formatBreadcrumbLabel(businessName, 'SBI', sbi),
      href: `/business/${sbi}`
    }
  ]
}

/**
 * Builds the VAT row data for the business details page.
 *
 * Unlike other fields, VAT supports two actions once a number exists, so the
 * change link is either a single URL (Add) or an object of summary list action
 * items (Change and Remove). The view handles both shapes.
 */
const buildVatDisplay = (vatNumber, sbi) => {
  const linkStyling = 'govuk-link--no-visited-state'

  if (!vatNumber) {
    return {
      value: 'No number added',
      action: 'Add',
      changeLink: BUSINESS_CHANGE_LINKS.businessVat(sbi)
    }
  }

  return {
    value: vatNumber,
    action: 'Change',
    changeLink: {
      items: [
        {
          href: BUSINESS_CHANGE_LINKS.businessVat(sbi),
          text: 'Change',
          visuallyHiddenText: 'VAT registration number',
          classes: linkStyling
        },
        {
          href: BUSINESS_CHANGE_LINKS.businessVatRemove(sbi),
          text: 'Remove',
          visuallyHiddenText: 'VAT registration number',
          classes: linkStyling
        }
      ]
    }
  }
}

export {
  businessDetailsPresenter
}
