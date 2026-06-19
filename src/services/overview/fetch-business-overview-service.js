/**
 * Returns the business overview (name + linked customers) for the given SBI
 * by querying the DAL, mapping the response and returning the mapped payload
 *
 * @module fetchBusinessOverviewService
 */

import { businessOverviewQuery } from '../../dal/queries/overview/business-details-overview.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapBusinessOverview } from '../../mappers/overview/business-overview-details-mapper.js'

// TODO: If businesses can have hundreds of customers, how will it perform?

const fetchBusinessOverviewService = async (sbi, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(businessOverviewQuery, { sbi }, email)

  if (dalResponse.data) {
    const mappedResponse = mapBusinessOverview(dalResponse.data)

    return mappedResponse
  }

  throw new Error('Failed to retrieve business overview')
}

export {
  fetchBusinessOverviewService
}
