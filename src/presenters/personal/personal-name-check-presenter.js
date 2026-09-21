/**
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-name-check` page
 * @module personalNameCheckPresenter
 */

import { constants, utils } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_CRN } from '../../constants/search-links.js'

const { PERSONAL: PERSONAL_CHANGE_LINKS } = constants.changeLinks.internal

const personalNameCheckPresenter = (data, crn) => {
  return {
    backLink: crn ? PERSONAL_CHANGE_LINKS.personalName(crn) : SEARCH_CRN,
    changeLink: PERSONAL_CHANGE_LINKS.personalName(crn),
    pageTitle: 'Check your name is correct before submitting',
    metaDescription: 'Check the full name for your personal account is correct.',
    userName: data.userName ?? null,
    crn: crn ?? null,
    fullName: utils.formatFullName(data.changePersonalName ?? data.fullName)
  }
}

export {
  personalNameCheckPresenter
}
