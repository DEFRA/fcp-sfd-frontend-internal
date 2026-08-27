/**
 * Formats data ready for presenting in the `/customer/{crn}/details/fix-check` page
 * @module personalFixCheckPresenter
 */

import { presenters } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const personalFixCheckPresenter = (personalDetails, crn) => {
  const {
    orderedSectionsToFix,
    changePersonalName,
    changePersonalDob,
    changePersonalEmail,
    changePersonalAddress,
    changePersonalPhoneNumbers
  } = personalDetails

  return {
    backLink: crn ? `/customer/${crn}/details/fix-list` : SEARCH_CRN,
    pageTitle: 'Check your details are correct before submitting',
    metaDescription: 'Check your details are correct before submitting',
    userName: personalDetails.info?.userName ?? null,
    crn: crn ?? null,
    changeLink: `/customer/${crn}/details/fix-list`,
    sections: orderedSectionsToFix,
    fullName: formatFullName(changePersonalName),
    dateOfBirth: formatDob(changePersonalDob),
    personalEmail: changePersonalEmail?.personalEmail ?? null,
    address: formatAddress(changePersonalAddress),
    personalTelephone: {
      telephone: changePersonalPhoneNumbers?.personalTelephone ?? null,
      mobile: changePersonalPhoneNumbers?.personalMobile ?? null
    }
  }
}

const formatDob = (dob) => {
  if (dob) {
    const { day, month, year } = dob
    // new Date() needs the format YYYY-MM-DD with leading zeros e.g. '1990-04-05' not '1990-4-5'
    const personalDob = new Date(
      `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    )

    return presenters.formatLongDate(personalDob)
  }

  return null
}

const formatAddress = (personalAddress) => {
  if (personalAddress) {
    return Object.values(personalAddress).filter(Boolean)
  }

  return null
}

const formatFullName = (nameData) => {
  if (nameData) {
    return [
      nameData.first,
      nameData.middle,
      nameData.last
    ].filter(Boolean).join(' ')
  }

  return null
}

export {
  personalFixCheckPresenter
}
