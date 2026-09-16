/**
 * Formats data ready for presenting in the `legal-status-change` page
 * @module businessLegalStatusChangePresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessLegalStatusChangePresenter = (data, payload) => {
  const sbi = data.sbi

  // payload/changeBusinessLegalStatus hold a status code from the form; otherwise use the code fetched from the DAL
  const selected = payload ?? data.changeBusinessLegalStatus ?? data.legalStatusCode

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'Change legal status',
    metaDescription: 'Update the legal status of this business.',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    businessLegalStatus: selected,
    businessLegalStatusItems: buildLegalStatusItems(selected)
  }
}

// Maps the LEGAL_STATUS constants into govukRadios items, marking the currently selected option
// The DAL code is numeric while our constants store it as a string, so compare as strings
const buildLegalStatusItems = (selected) => {
  return Object.values(constants.business.LEGAL_STATUS).map(({ code, text }) => ({
    value: code,
    text,
    checked: String(code) === String(selected)
  }))
}

export { businessLegalStatusChangePresenter }
