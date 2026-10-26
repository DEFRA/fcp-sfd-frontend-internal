/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix-check` page
 *
 * @module businessFixCheckPresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix-check` page
 *
 * @param {object} data - The business data, including the ordered sections to fix and any pending changes held in the session
 * @param {string} sbi - The Single Business Identifier
 *
 * @returns {object} The page data for the view
 */
const businessFixCheckPresenter = (data, sbi) => {
  const {
    orderedSectionsToFix,
    changeBusinessName,
    changeBusinessAddress,
    changeBusinessPhoneNumbers,
    changeBusinessEmail,
    changeBusinessVat
  } = data

  return {
    backLink: sbi ? `/business/${sbi}/details/fix-list` : SEARCH_SBI,
    pageTitle: 'Check your details are correct before submitting',
    metaDescription: 'Check your details are correct before submitting',
    businessName: data.businessName ?? null,
    sbi: sbi ?? null,
    changeLink: `/business/${sbi}/details/fix-list`,
    sections: orderedSectionsToFix,
    changeBusinessName: changeBusinessName?.businessName ?? null,
    address: formatAddress(changeBusinessAddress),
    businessTelephone: {
      telephone: changeBusinessPhoneNumbers?.businessTelephone ?? null,
      mobile: changeBusinessPhoneNumbers?.businessMobile ?? null
    },
    businessEmail: changeBusinessEmail?.businessEmail ?? null,
    vatNumber: changeBusinessVat?.vatNumber ?? null
  }
}

const formatAddress = (businessAddress) => {
  if (businessAddress) {
    return Object.values(businessAddress).filter(Boolean)
  }

  return null
}

export {
  businessFixCheckPresenter
}
