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

  // The registration number can be changed on its own from the business details page, leaving the legal
  // status untouched, so fall back to the fetched status when the session holds no change for it
  const legalStatusCode = businessDetails.changeBusinessLegalStatus ?? businessDetails.info?.legalStatusCode

  const isCharity = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES.includes(String(legalStatusCode))
  const isCompany = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES.includes(String(legalStatusCode))
  const requiresRegistrationNumber = isCharity || isCompany

  // Ignore a session value left over from a status that no longer requires a registration number
  const registrationNumberChanged = requiresRegistrationNumber && Boolean(
    businessDetails.changeBusinessCharityCommissionRegistrationNumber ||
    businessDetails.changeBusinessCompanyRegistrationNumber
  )

  if (!legalStatusChanged && !registrationNumberChanged) {
    return
  }

  const sbi = businessDetails.info.sbi

  const { companiesHouseNumber, charityCommissionNumber } = resolveRegistrationNumbers(businessDetails, requiresRegistrationNumber)

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
    const legalStatusVariables = {
      input: {
        sbi,
        legalStatusCode: Number(legalStatusCode)
      }
    }

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

// The user may be changing away from a legal status that requires a registration number, so default both to null
const resolveRegistrationNumbers = (businessDetails, requiresRegistrationNumber) => {
  if (!requiresRegistrationNumber) {
    return { companiesHouseNumber: null, charityCommissionNumber: null }
  }

  const { info } = businessDetails

  // Fall back to the fetched value so an unchanged, already-stored number isn't wiped out
  return {
    companiesHouseNumber: businessDetails.changeBusinessCompanyRegistrationNumber ?? info?.registrationNumbers?.companiesHouse ?? null,
    charityCommissionNumber: businessDetails.changeBusinessCharityCommissionRegistrationNumber ?? info?.registrationNumbers?.charityCommission ?? null
  }
}

const getSuccessMessage = (legalStatusChanged, isCharity) => {
  if (legalStatusChanged) {
    return constants.successMessages.BUSINESS_LEGAL_STATUS
  }

  if (isCharity) {
    return constants.successMessages.BUSINESS_CHARITY_REGISTRATION_NUMBER
  }

  return constants.successMessages.BUSINESS_COMPANY_REGISTRATION_NUMBER
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
