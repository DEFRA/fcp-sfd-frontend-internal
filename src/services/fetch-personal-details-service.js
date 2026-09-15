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
