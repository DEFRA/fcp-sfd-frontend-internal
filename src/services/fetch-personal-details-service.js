/**
 * Returns personal details for a given CRN by querying the DAL,
 * maps the response and returns the mapped payload
 *
 * @module fetchPersonalDetailsService
 */

import Boom from '@hapi/boom'
import { mappers } from '@defra/fcp-sfd-frontend-engine'

import { getDalConnector } from '../dal/connector.js'
import { personalDetailsQuery } from '../dal/queries/personal-details.js'

/**
 * Returns personal details for a given CRN by querying the DAL,
 * maps the response and returns the mapped payload
 *
 * @param {string} crn - The customer reference number
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object>} The mapped personal details
 *
 * @throws {Boom.notFound} If the DAL returns no data for the customer
 */
const fetchPersonalDetailsService = async (crn, email) => {
  const dalConnector = getDalConnector()
  const dalResponse = await dalConnector.query(personalDetailsQuery, { crn }, email)

  if (dalResponse.data) {
    const mappedResponse = mappers.personalDetails(dalResponse.data)

    return mappedResponse
  }

  throw Boom.notFound('Customer personal details not found')
}

export {
  fetchPersonalDetailsService
}
