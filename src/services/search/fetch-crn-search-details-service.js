/**
 * Returns the customer details for the given CRN by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchCrnSearchDetailsService
 */

import { customerDetailsByCrn } from '../../dal/queries/customer-details-by-crn.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapCustomerDetailsByCrn } from '../../mappers/customer-details-by-crn-mapper.js'

/**
 * Returns the customer details for the given CRN by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object|null>} The mapped customer details, or null if the customer was not found
 *
 * @throws {Error} If the DAL returns an error other than the customer not being found
 */
const fetchCrnSearchDetailsService = async (crn, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(customerDetailsByCrn, { crn }, email)

  if (dalResponse.data) {
    const mappedResponse = mapCustomerDetailsByCrn(dalResponse.data)

    return mappedResponse
  }

  const errorMessage = dalResponse?.errors?.[0]?.message
  if (errorMessage === 'Rural payments customer not found') {
    return null
  }

  throw new Error('Failed to retrieve customer details')
}

export {
  fetchCrnSearchDetailsService
}
