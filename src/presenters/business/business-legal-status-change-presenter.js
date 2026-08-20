/**
 * Formats data ready for presenting in the `business-legal-status-change` page
 * @module businessLegalStatusChangePresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'

const businessLegalStatusChangePresenter = (data, payload) => {
  const backLink = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  // payload/changeBusinessLegalStatus hold a status code from the form; otherwise use the code fetched from the DAL
  const selected = payload ?? data.changeBusinessLegalStatus ?? data.info?.legalStatusCode

  return {
    backLink: { href: backLink },
    pageTitle: 'Change legal status',
    metaDescription: 'Update the legal status of this business.',
    businessLegalStatus: selected,
    businessLegalStatusItems: buildLegalStatusItems(selected)
  }
}

// Maps the BUSINESS_LEGAL_STATUS constants into govukRadios items, marking the currently selected option
// The DAL code is numeric while our constants store it as a string, so compare as strings
const buildLegalStatusItems = (selected) => {
  return Object.values(constants.BUSINESS_LEGAL_STATUS).map(({ code, text }) => ({
    value: code,
    text,
    checked: String(code) === String(selected)
  }))
}

export { businessLegalStatusChangePresenter }
