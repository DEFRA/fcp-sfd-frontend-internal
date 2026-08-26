/**
 * Formats data ready for presenting in the `business-legal-status-check` page
 * @module businessLegalStatusCheckPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const businessLegalStatusCheckPresenter = (data) => {
  const sbi = data.info?.sbi
  const legalStatusCode = String(data.changeBusinessLegalStatus ?? data.info?.legalStatusCode ?? '')
  const { isCharity, isCompany } = isCharityOrCompany(legalStatusCode)

  const { backLink, legalStatusChangeLink, registrationNumberChangeLink } = setLinks(isCharity, isCompany, sbi)

  return {
    backLink,
    // Each row links back to the specific page that captured it, rather than both sharing the back link above
    legalStatusChangeLink,
    registrationNumberChangeLink,
    pageTitle: 'Check your business legal status is correct before submitting',
    metaDescription: 'Check the legal status of this business is correct.',
    businessName: data.info?.businessName ?? null,
    sbi: sbi ?? null,
    businessLegalStatus: getLegalStatusText(data.changeBusinessLegalStatus ?? data.info?.legalStatusCode) ?? null,
    registrationNumberLabel: getRegistrationNumberLabel(isCharity, isCompany),
    registrationNumber: getRegistrationNumber(data, isCharity, isCompany)
  }
}

const setLinks = (isCharity, isCompany, sbi) => {
  if (sbi) {
    const legalStatusChangeLink = `/business/${sbi}/business-legal-status-change`
    const registrationNumberChangeLink = `/business/${sbi}/business-legal-status-enter`

    if (isCharity || isCompany) {
      return {
        backLink: `/business/${sbi}/business-legal-status-enter`,
        legalStatusChangeLink,
        registrationNumberChangeLink
      }
    }
    return {
      backLink: `/business/${sbi}/business-legal-status-change`,
      legalStatusChangeLink,
      registrationNumberChangeLink
    }
  }
  return {
    backLink: SEARCH_SBI,
    legalStatusChangeLink: SEARCH_SBI,
    registrationNumberChangeLink: SEARCH_SBI
  }
}

const isCharityOrCompany = (legalStatusCode) => {
  const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)
  const isCompany = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES.includes(legalStatusCode)

  return { isCharity, isCompany }
}

const getRegistrationNumberLabel = (isCharity, isCompany) => {
  if (isCharity) {
    return 'Charity commission registration number'
  }

  if (isCompany) {
    return 'Company registration number'
  }

  return null
}

const getRegistrationNumber = (data, isCharity, isCompany) => {
  if (isCharity) {
    return data.changeBusinessCharityCommissionRegistrationNumber ?? data.info?.registrationNumbers?.charityCommission ?? null
  }

  if (isCompany) {
    return data.changeBusinessCompanyRegistrationNumber ?? data.info?.registrationNumbers?.companiesHouse ?? null
  }

  return null
}

// changeBusinessLegalStatus is stored as a numeric code, so look up its display text
const getLegalStatusText = (payloadBusinessLegalStatus) => {
  if (!payloadBusinessLegalStatus) {
    return null
  }

  const match = Object.values(constants.business.LEGAL_STATUS).find(({ code }) => {
    return String(code) === String(payloadBusinessLegalStatus)
  })

  return match?.text ?? null
}

export { businessLegalStatusCheckPresenter }
