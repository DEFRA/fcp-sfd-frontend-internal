/**
 * Returns the customer details for the given CRN by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchCustomerOverviewDetailsService
 */

import { customerDetailsOverview } from '../../dal/queries/overview/customer-details-overview.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapCustomerOverviewDetails } from '../../mappers/overview/customer-overview-details-mapper.js'

const fetchCustomerOverviewDetailsService = async (crn, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(customerDetailsOverview, { crn }, email)

  if (dalResponse.data) {
    const mappedResponse = mapCustomerOverviewDetails(dalResponse.data)

    return mappedResponse
  }

  throw new Error('Failed to retrieve customer details')
}

export {
  fetchCustomerOverviewDetailsService
}
