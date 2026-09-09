/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix-list` page
 * @module businessFixListPresenter
 */

import { presenters, constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessFixListPresenter = (data, payload, sbi, errors = null) => {
  const { BUSINESS_SECTION_FIELD_ORDER } = constants.interrupterJourney

  const sortedErrors = errors
    ? presenters.sortErrorsBySectionOrder(errors, data.orderedSectionsToFix, BUSINESS_SECTION_FIELD_ORDER)
    : null

  return {
    backLink: sbi ? `/business/${sbi}/details/fix?source=${data.source}` : SEARCH_SBI,
    pageTitle: 'Your business details to update',
    metaDescription: 'Your business details to update.',
    businessName: data.info?.businessName ?? null,
    sbi: sbi ?? null,
    sections: data.orderedSectionsToFix,
    changeBusinessName: payload?.businessName ?? data.changeBusinessName?.businessName ?? data.info?.businessName ?? null,
    businessTelephone: presenters.formatNumber(payload?.businessTelephone, data.changeBusinessPhoneNumbers?.businessTelephone, data.contact.landline),
    businessMobile: presenters.formatNumber(payload?.businessMobile, data.changeBusinessPhoneNumbers?.businessMobile, data.contact.mobile),
    businessEmail: payload?.businessEmail ?? data.changeBusinessEmail?.businessEmail ?? data.contact.email,
    address: formatAddress(payload, data.changeBusinessAddress),
    vatNumber: payload?.vatNumber ?? data.changeBusinessVat?.vatNumber ?? data.info?.vat,
    errors: sortedErrors
  }
}

const formatAddress = (payload, changeBusinessAddress) => {
  if (payload) {
    const {
      address1,
      address2,
      address3,
      city,
      county,
      postcode,
      country
    } = payload

    return { address1, address2, address3, city, county, postcode, country }
  }

  if (changeBusinessAddress) {
    return presenters.formatChangedAddress(changeBusinessAddress)
  }

  return null
}

export {
  businessFixListPresenter
}
