/**
 * Returns the business details for the given sbi by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @module fetchSbiSearchDetailsService
 */

import { businessDetailsBySbi } from '../../dal/queries/business-details-by-sbi.js'
import { getDalConnector } from '../../dal/connector.js'
import { mapBusinessDetailsBySbi } from '../../mappers/business-details-by-sbi-mapper.js'

/**
 * Returns the business details for the given sbi by querying the DAL, mapping
 * the response and returning the mapped payload
 *
 * @param {string} sbi - The Single Business Identifier
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object|null>} The mapped business details, or null if the business was not found
 *
 * @throws {Error} If the DAL returns an error other than the business not being found
 */
const fetchSbiSearchDetailsService = async (sbi, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(businessDetailsBySbi, { sbi }, email)

  if (dalResponse.data) {
    const mappedResponse = mapBusinessDetailsBySbi(dalResponse.data)

    return mappedResponse
  }

  const errorMessage = dalResponse?.errors?.[0]?.message
  if (errorMessage === 'Rural payments organisation not found') {
    return null
  }

  throw new Error('Failed to retrieve business details')
}

export {
  fetchSbiSearchDetailsService
}
