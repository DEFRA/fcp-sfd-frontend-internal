/**
 * Formats data ready for presenting in the `/customer/{CRN}/account-date-of-birth-check` page
 * @module personalDobCheckPresenter
 */

import moment from 'moment'

const personalDobCheckPresenter = (personalDetails, crn) => {
  const dob = personalDetails.changePersonalDob ?? personalDetails.info.dateOfBirth
  const { day, month, year } = dob
  const personalDob = new Date(`${month}/${day}/${year}`)

  return {
    backLink: { href: `/customer/${crn}/account-date-of-birth-change` },
    pageTitle: 'Check your date of birth is correct before submitting',
    metaDescription: 'Check the date of birth for your personal account is correct.',
    userName: personalDetails.info.userName ?? null,
    changeLink: `/customer/${crn}/account-date-of-birth-change`,
    dateOfBirth: moment(personalDob).format('D MMMM YYYY')
  }
}

export {
  personalDobCheckPresenter
}
