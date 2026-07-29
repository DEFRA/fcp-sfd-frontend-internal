/**
 * Service to update personal date of birth
 *
 * Fetches the pending personal dob changes from the session
 * Calls the DAL to persist the updated date of birth using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalDobChangeService
 */

import moment from 'moment'
import { mutations } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalDobChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalDob')

  if (!personalDetails.changePersonalDob) {
    return
  }

  const { day, month, year } = personalDetails.changePersonalDob
  const personalDob = new Date(`${month}/${day}/${year}`)

  const variables = {
    input: {
      dateOfBirth: moment(personalDob).format('YYYY-MM-DD'),
      crn: personalDetails.crn
    }
  }

  await updateDalService(mutations.updateCustomerDob, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your date of birth')
}

export {
  updatePersonalDobChangeService
}
