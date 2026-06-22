/**
 * Returns the business details for the given SBI by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchBusinessOverviewDetailsService
 */

import { businessDetailsOverview } from '../../dal/queries/overview/business-details-overview.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapBusinessOverviewDetails } from '../../mappers/overview/business-overview-details-mapper.js'

const fetchBusinessOverviewDetailsService = async (sbi, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(businessDetailsOverview, { sbi }, email)

  if (dalResponse.data) {
    const mappedResponse = mapBusinessOverviewDetails(dalResponse.data)

    return mappedResponse
  }

  throw new Error('Failed to retrieve business details')
}

export {
  fetchBusinessOverviewDetailsService
}
