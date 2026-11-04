/**
 * Returns the customer details for the given CRN by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchCustomerOverviewDetailsService
 */

import Boom from '@hapi/boom'
import { customerDetailsOverview } from '../../dal/queries/overview/customer-details-overview.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapCustomerOverviewDetails } from '../../mappers/overview/customer-overview-details-mapper.js'

/**
 * Returns the customer details for the given CRN by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object>} The mapped customer overview details
 *
 * @throws {Boom.notFound} If the DAL returns no data for the customer
 */
const fetchCustomerOverviewDetailsService = async (crn, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(customerDetailsOverview, { crn }, email)

  if (dalResponse.data) {
    const mappedResponse = mapCustomerOverviewDetails(dalResponse.data)

    return mappedResponse
  }

  throw Boom.notFound('Customer not found')
}

export {
  fetchCustomerOverviewDetailsService
}
