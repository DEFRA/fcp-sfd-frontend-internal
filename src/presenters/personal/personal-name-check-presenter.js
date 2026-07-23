/**
 * Formats data ready for presenting in the `/customer/{CRN}/details/account-name-check` page
 * @module personalNameCheckPresenter
 */

import { utils } from '@defra/fcp-sfd-frontend-engine'

const personalNameCheckPresenter = (personalDetails, crn) => {
  return {
    backLink: { href: `/customer/${crn}/account-name-change` },
    changeLink: `/customer/${crn}/account-name-change`,
    pageTitle: 'Check your name is correct before submitting',
    metaDescription: 'Check the full name for your personal account is correct.',
    userName: personalDetails.info.userName ?? null,
    fullName: utils.formatFullName(personalDetails.changePersonalName ?? personalDetails.info.fullName)
  }
}

export {
  personalNameCheckPresenter
}
