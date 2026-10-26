/**
 * Returns the business details for the given SBI by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchBusinessDetailsService
 */

import Boom from '@hapi/boom'
import { businessDetailsQuery } from '../../dal/queries/business-details.js'
import { getDalConnector } from '../../dal/connector.js'
import { mappers } from '@defra/fcp-sfd-frontend-engine'

/**
 * Returns the business details for the given SBI by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @param {string} sbi - The Single Business Identifier
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object>} The mapped business details
 *
 * @throws {Boom.notFound} If the DAL returns no data for the business
 */
const fetchBusinessDetailsService = async (sbi, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(businessDetailsQuery, { sbi }, email)

  if (dalResponse.data) {
    const mappedResponse = mappers.businessDetails(dalResponse.data)

    return mappedResponse
  }

  throw Boom.notFound('Business not found')
}

export {
  fetchBusinessDetailsService
}
