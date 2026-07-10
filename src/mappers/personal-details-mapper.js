/**
 * Takes the raw data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 * @returns {Object} Formatted personal details data
 * @throws {Error} If value is null, undefined, or missing required customer structure
 */

import { mappers } from '@defra/fcp-sfd-frontend-engine'

const mapPersonalDetails = (value) => {
  // Validate input before processing
  protectAgainstNull(value)

  const customerInfo = value.customer.info
  const customerName = customerInfo.name

  // Safely split date of birth
  const [year, month, day] = customerInfo.dateOfBirth ? customerInfo.dateOfBirth.split('-') : []

  return {
    crn: value.customer.crn ?? null,
    info: {
      userName: customerName ? mappers.customerName(customerName).userName : null,
      fullName: {
        first: customerName?.first ?? null,
        last: customerName?.last ?? null,
        middle: customerName?.middle ?? null
      },
      fullNameJoined: [
        customerName?.first,
        customerName?.middle,
        customerName?.last
      ].filter(Boolean).join(' '),
      dateOfBirth: {
        full: customerInfo.dateOfBirth ?? null,
        day: day ?? null,
        month: month ?? null,
        year: year ?? null
      }
    },
    address: customerInfo.address ? mappers.address(customerInfo.address) : {},
    contact: {
      email: customerInfo.email?.address ?? null,
      telephone: customerInfo.phone?.landline ?? null,
      mobile: customerInfo.phone?.mobile ?? null
    }
  }
}

/**
 * Validates that the input value has the required structure before mapping
 *
 * @param {Object} value - The data from the DAL
 * @throws {Error} If value is null, undefined, or missing required customer structure
 */
const protectAgainstNull = (value) => {
  // Guard against null or undefined input
  if (!value) {
    throw new Error('Personal details value cannot be null or undefined')
  }

  // Guard against missing customer object
  if (!value.customer) {
    throw new Error('Personal details value must contain a customer object')
  }

  // Guard against missing customer info
  if (!value.customer.info) {
    throw new Error('Customer must contain an info object')
  }
}

export {
  mapPersonalDetails
}
