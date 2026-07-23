/**
 * Service to update a personal full name (first, last and middle)
 *
 * Fetches the pending personal name changes from the session
 * Calls the DAL to persist the updated name fields using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalNameChangeService
 */

import { mutations } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalNameChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalName')

  if (!personalDetails.changePersonalName) {
    return
  }

  const variables = {
    input: {
      first: personalDetails.changePersonalName.first,
      last: personalDetails.changePersonalName.last,
      middle: personalDetails.changePersonalName.middle ?? null,
      crn: personalDetails.crn
    }
  }

  await updateDalService(mutations.updateCustomerName, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your full name')
}

export {
  updatePersonalNameChangeService
}
