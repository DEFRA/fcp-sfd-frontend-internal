/**
 * Formats data ready for presenting in the `/business/{sbi}/details` page
 * @module businessDetailsPresenter
 */

import { constants, presenters } from '@defra/fcp-sfd-frontend-engine'
import { BUSINESS_CHANGE_LINKS } from '../../constants/change-links.js'
import { config } from '../../config/index.js'
import { buildEntityBreadcrumbs } from '../base-presenter.js'

const CHANGE_LINK = '#'

const businessDetailsPresenter = (data, sbi, yar, hasValidBusinessDetails, sectionsNeedingUpdate) => {
  const { info, address, contact } = data
  const changeLinks = formatChangeLinks(sbi, hasValidBusinessDetails, sectionsNeedingUpdate)
  const countyParishHoldingNumbers = presenters.formatCph(info.countyParishHoldingNumbers)
  const addressLines = presenters.formatBusinessAddress(address)
  const hasAddress = addressLines.length > 0

  return {
    notification: yar ? yar.flash('notification')[0] : null,
    pageTitle: 'View and update your business details',
    metaDescription: 'View and update your business details.',
    sbi,
    breadcrumbs: buildEntityBreadcrumbs('sbi', sbi, info.businessName, `/business/${sbi}`),
    businessName: {
      value: info.businessName || 'Not added',
      action: presenters.getActionText(info.businessName),
      changeLink: changeLinks.name
    },
    businessAddress: {
      value: hasAddress ? addressLines : 'Not added',
      action: presenters.getActionText(hasAddress),
      changeLink: changeLinks.address
    },
    businessTelephone: {
      telephone: data.contact.landline || 'Not added',
      mobile: data.contact.mobile || 'Not added',
      action: presenters.getActionText(data.contact.landline || data.contact.mobile),
      changeLink: changeLinks.phone
    },
    businessEmail: {
      value: contact.email || 'Not added',
      action: presenters.getActionText(contact.email),
      changeLink: changeLinks.email
    },
    vatNumber: buildVatDisplay(info.vat, sbi, changeLinks.vat),
    tradeNumber: info.traderNumber ?? null,
    vendorRegistrationNumber: info.vendorNumber ?? null,
    countyParishHoldingNumbers,
    countyParishHoldingNumbersText: presenters.formatCphText(countyParishHoldingNumbers.length),
    businessLegalStatus: {
      value: info.legalStatus || 'Not added',
      action: presenters.getActionText(info.legalStatus),
      changeLink: BUSINESS_CHANGE_LINKS.businessLegalStatus(sbi)
    },
    legalStatusRegistrationNumber: buildLegalStatusRegistrationNumberDisplay(info, sbi),
    businessType: createEditableValueField(info.type, 'Not added')
  }
}

/**
 * Builds change links for business details based on whether the
 * business details interrupter is enabled and the validity of the data.
 *
 * When the interrupter is disabled or all business details are valid,
 * standard change links are returned.
 *
 * When the interrupter is enabled and details are invalid:
 * - If only one section needs updating, its normal change link is used
 * - Otherwise, all links point to the business details fix journey
 *
 * VAT is null unless it is routed through the interrupter, because the VAT row
 * builds its own add/change/remove links.
 */
const formatChangeLinks = (sbi, hasValidBusinessDetails, sectionsNeedingUpdate = []) => {
  const CHANGE_LINKS = {
    name: BUSINESS_CHANGE_LINKS.businessName(sbi),
    address: BUSINESS_CHANGE_LINKS.businessAddress(sbi),
    phone: BUSINESS_CHANGE_LINKS.businessTelephone(sbi),
    email: BUSINESS_CHANGE_LINKS.businessEmail(sbi),
    vat: null
  }

  const businessDetailsInterrupterEnabled = config.get('featureToggle.businessDetailsInterrupterEnabled')

  // Happy path – interrupter off or data is valid
  if (!businessDetailsInterrupterEnabled || hasValidBusinessDetails || sectionsNeedingUpdate.length === 0) {
    return CHANGE_LINKS
  }

  // Interrupter on and data invalid
  const singleSection = sectionsNeedingUpdate.length === 1 ? sectionsNeedingUpdate[0] : null
  const fixLink = (section) => `/business/${sbi}/details/fix?source=${section}`

  return {
    name: singleSection === 'name' ? CHANGE_LINKS.name : fixLink('name'),
    address: singleSection === 'address' ? CHANGE_LINKS.address : fixLink('address'),
    phone: singleSection === 'phone' ? CHANGE_LINKS.phone : fixLink('phone'),
    email: singleSection === 'email' ? CHANGE_LINKS.email : fixLink('email'),
    vat: singleSection === 'vat' ? null : fixLink('vat')
  }
}

const createEditableValueField = (value, emptyValueText) => {
  return {
    value: value || emptyValueText,
    action: presenters.getActionText(value),
    changeLink: CHANGE_LINK
  }
}

/**
 * Builds the VAT row data for the business details page.
 *
 * Unlike other fields, VAT supports two actions once a number exists, so the
 * change link is either a single URL (Add) or an object of summary list action
 * items (Change and Remove). The view handles both shapes.
 *
 * When `vatFixLink` is set the interrupter is routing VAT through the fix
 * journey, so the row keeps its usual actions but every link points there.
 */
const buildVatDisplay = (vatNumber, sbi, vatFixLink) => {
  const linkStyling = 'govuk-link--no-visited-state'

  if (!vatNumber) {
    return {
      value: 'No number added',
      action: 'Add',
      changeLink: vatFixLink ?? BUSINESS_CHANGE_LINKS.businessVat(sbi)
    }
  }

  return {
    value: vatNumber,
    action: 'Change',
    changeLink: {
      items: [
        {
          href: vatFixLink ?? BUSINESS_CHANGE_LINKS.businessVat(sbi),
          text: 'Change',
          visuallyHiddenText: 'VAT registration number',
          classes: linkStyling
        },
        {
          href: vatFixLink ?? BUSINESS_CHANGE_LINKS.businessVatRemove(sbi),
          text: 'Remove',
          visuallyHiddenText: 'VAT registration number',
          classes: linkStyling
        }
      ]
    }
  }
}

/**
 * Builds the registration number row for the business details page.
 *
 * Only charity and company legal statuses hold a registration number, so this
 * returns null for every other status and the view omits the row entirely. The
 * change link goes straight to the enter page, letting the number be corrected
 * without going through the legal status journey.
 */
const buildLegalStatusRegistrationNumberDisplay = (info, sbi) => {
  // The DAL returns the legal status code as a number, the engine codes are strings
  const legalStatusCode = String(info.legalStatusCode ?? '')
  const registrationNumbers = info.registrationNumbers ?? {}

  let label
  let number

  if (constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)) {
    label = 'Charity commission registration number'
    number = registrationNumbers.charityCommission
  } else if (constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)) {
    label = 'Company registration number'
    number = registrationNumbers.companiesHouse
  } else {
    return null
  }

  return {
    label,
    value: number || 'Not added',
    action: presenters.getActionText(number),
    changeLink: BUSINESS_CHANGE_LINKS.businessLegalStatusRegistrationNumber(sbi)
  }
}

export {
  businessDetailsPresenter
}
