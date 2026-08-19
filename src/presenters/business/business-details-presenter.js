/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
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
    vatNumber: buildVatDisplay(data.info.vat, BUSINESS_CHANGE_LINKS.businessVat(sbi)),
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

const formatOverviewBreadcrumb = (businessName, sbi) => {
  return businessName ? `${businessName} (SBI: ${sbi})` : `SBI: ${sbi}`
}

/**
 * Builds the VAT row data for the business details page.
 *
 * VAT is more complex than other fields because:
 * - Users may or may not have permission to change VAT details
 * - VAT supports multiple actions (add, change, remove)
 * - During the business details interrupter flow, VAT actions may need
 *   to route via the business-fix journey instead of the normal pages
 *
 * This function does not return direct URLs in all cases.
 * Instead, it returns the data needed by the view to render:
 * - the displayed VAT value
 * - the action text (Add / Change)
 * - either a single change link, multiple links (Change / Remove),
 *   or no links at all
 *
 * Behaviour summary:
 * - If `vatChangeState` is null, the user does not have permission to
 *   change VAT and no actions are shown.
 * - If `vatChangeState` is `'interrupter'`, links are routed via the
 *   business-fix pages to force the user through the interrupter journey.
 * - Otherwise, normal add/change/remove links are returned.
 */
const buildVatDisplay = (vatNumber, vatChangeState) => {
  const hasVat = Boolean(vatNumber)
  const value = vatNumber || 'No number added'
  const linkStyling = 'govuk-link--no-visited-state'

  // If no vatChangeState it means the user does not have permission to change VAT details
  if (!vatChangeState) {
    return {
      value,
      action: null,
      changeLink: null
    }
  }

  // Interrupter flow: invalid data, user has permission, must go via business-fix
  if (vatChangeState === 'interrupter') {
    const changeLink = '/business-fix?source=vat'
    // Links still need to display the same as normal, but if no VAT number, link goes to interrupter add page
    if (!hasVat) {
      return {
        value,
        action: 'Add',
        changeLink
      }
    }

    // If VAT number exists, show normal change/remove links but via interrupter pages
    return {
      value: vatNumber,
      action: 'Change',
      changeLink: {
        items: [
          {
            href: changeLink,
            text: 'Change',
            visuallyHiddenText: 'VAT registration number',
            classes: linkStyling
          },
          {
            href: changeLink,
            text: 'Remove',
            visuallyHiddenText: 'VAT registration number',
            classes: linkStyling
          }
        ]
      }
    }
  }

  // Normal flow: user has permission and no interrupter
  if (!hasVat) {
    return {
      value,
      action: 'Add',
      changeLink: BUSINESS_CHANGE_LINKS.vatNumberAdd
    }
  }

  return {
    value,
    action: 'Change',
    changeLink: {
      items: [
        {
          href: BUSINESS_CHANGE_LINKS.vatNumberChange,
          text: 'Change',
          visuallyHiddenText: 'VAT registration number',
          classes: linkStyling
        },
        {
          href: BUSINESS_CHANGE_LINKS.vatNumberRemove,
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
