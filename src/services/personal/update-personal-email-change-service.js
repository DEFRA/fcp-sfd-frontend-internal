/**
 * Service to update a personal email address
 *
 * Fetches the pending personal email change from the session
 * Calls the DAL to persist the updated email using updateDalService
 * Clears the cached personal details data from the session
 * Displays a success flash notification to the user
 *
 * @module updatePersonalEmailChangeService
 */

import { mutations } from '@defra/fcp-sfd-frontend-engine'

import { fetchPersonalChangeService } from './fetch-personal-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { updateDalService } from '../DAL/update-dal-service.js'

const updatePersonalEmailChangeService = async (yar, crn, email) => {
  const personalDetails = await fetchPersonalChangeService(yar, crn, email, 'changePersonalEmail')

  if (!personalDetails.changePersonalEmail) {
    return
  }

  const variables = {
    input: {
      email: {
        address: personalDetails.changePersonalEmail
      },
      crn: personalDetails.crn
    }
  }

  await updateDalService(mutations.updateCustomerEmail, variables, email)

  yar.clear('personalDetailsUpdate')

  flashNotification(yar, 'Success', 'You have updated your personal email address')
}

export {
  updatePersonalEmailChangeService
}
