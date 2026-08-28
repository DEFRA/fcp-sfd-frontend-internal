/**
 * Service to update a business's legal status
 *
 * Fetches the pending legal status and registration-number changes from the session.
 * Builds the variables for the two DAL mutations that update the business legal status
 * and registration numbers together, then sends both via updateDalService.
 * Clears the cached business details data from the session and displays a success flash
 * notification to the user.
 *
 * @module updateBusinessLegalStatusChangeService
 */

import { mutations, constants } from '@defra/fcp-sfd-frontend-engine'

import { updateDalService } from '../DAL/update-dal-service.js'
import { fetchBusinessChangeService } from './fetch-business-change-service.js'
import { flashNotification } from '../../utils/notifications/flash-notification.js'
import { BUSINESS_LEGAL_STATUS_SESSION_FIELDS } from '../../constants/business-legal-status-session-fields.js'

const updateBusinessLegalStatusChangeService = async (yar, credentials) => {
  const businessDetails = await fetchBusinessChangeService(yar, credentials, BUSINESS_LEGAL_STATUS_SESSION_FIELDS)

  const legalStatusChanged = Boolean(businessDetails.changeBusinessLegalStatus)
  const registrationNumberChanged = Boolean(
    businessDetails.changeBusinessCharityCommissionRegistrationNumber ??
    businessDetails.changeBusinessCompanyRegistrationNumber
  )

  if (!legalStatusChanged && !registrationNumberChanged) {
    return
  }

  const sbi = businessDetails.info.sbi

  // The registration number can be changed on its own from the business details page, leaving the legal
  // status untouched, so fall back to the fetched status when the session holds no change for it
  const legalStatusCode = businessDetails.changeBusinessLegalStatus ?? businessDetails.info?.legalStatusCode

  const legalStatusVariables = {
    input: {
      sbi,
      legalStatusCode: Number(legalStatusCode)
    }
  }

  const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(String(legalStatusCode))
  const isCompany = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES.includes(String(legalStatusCode))
  const requiresRegistrationNumber = isCharity || isCompany

  // Default the registration numbers to null, as the user may be changing away from a legal status that requires one
  let companiesHouseNumber = null
  let charityCommissionNumber = null

  // If the new legal status requires a registration number, fetch it from the session and send it to the DAL mutation
  if (requiresRegistrationNumber) {
    companiesHouseNumber = businessDetails.changeBusinessCompanyRegistrationNumber ?? null
    charityCommissionNumber = businessDetails.changeBusinessCharityCommissionRegistrationNumber ?? null
  }

  const registrationNumbersVariables = {
    input: {
      sbi,
      registrationNumbers: {
        companiesHouse: companiesHouseNumber,
        charityCommission: charityCommissionNumber
      }
    }
  }

  // Execute in sequence because both mutations touch additional business details in the upstream.
  // Running these in parallel can result in stale-write ordering where the legal status change is lost.
  if (legalStatusChanged) {
    const legalStatusResponse = await updateDalService(mutations.updateBusinessLegalStatus, legalStatusVariables, credentials.email)
    assertMutationSuccess(legalStatusResponse, 'updateBusinessLegalStatus')
  }

  const registrationNumbersResponse = await updateDalService(
    mutations.updateBusinessRegistrationNumbers,
    registrationNumbersVariables,
    credentials.email
  )
  assertMutationSuccess(registrationNumbersResponse, 'updateBusinessRegistrationNumbers')

  yar.clear('businessDetailsUpdate')

  flashNotification(yar, 'Success', getSuccessMessage(legalStatusChanged, isCharity))
}

const getSuccessMessage = (legalStatusChanged, isCharity) => {
  if (legalStatusChanged) {
    return constants.successMessages.BUSINESS_LEGAL_STATUS ?? 'You have updated your business legal status'
  }

  if (isCharity) {
    return 'You have updated your charity commission registration number'
  }

  return 'You have updated your company registration number'
}

const assertMutationSuccess = (response, mutationFieldName) => {
  const success = response?.data?.[mutationFieldName]?.success

  if (success !== true) {
    throw new Error(`DAL mutation did not succeed: ${mutationFieldName}`)
  }
}

export {
  updateBusinessLegalStatusChangeService
}
