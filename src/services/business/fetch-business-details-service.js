/**
 * Returns the `businessDetails` from the session cache if defined,
 * otherwise queries the DAL, maps the response, updates the cache
 * and returns the mapped payload
 *
 * @module fetchBusinessDetailsService
 */

import { dalConnector } from '../../dal/connector.js'
import { businessDetailsQuery } from '../../dal/queries/business-details.js'
import { mapBusinessDetails } from '../../mappers/business-details-mapper.js'
import { config } from '../../config/index.js'
import { mappedData } from '../../mock-data/mock-business-details.js'

const fetchBusinessDetailsService = async (yar, credentials) => {
  const businessDetails = yar.get('businessDetails')
  if (businessDetails) {
    return businessDetails
  }

  const businessDetailsData = config.get('featureToggle.dalConnection') ? await getFromDal(credentials) : mappedData

  yar.set('businessDetails', businessDetailsData)

  return businessDetailsData
}

const getFromDal = async (credentials) => {
  const { sbi, crn } = credentials

  const dalResponse = await dalConnector(businessDetailsQuery, { sbi, crn })

  if (dalResponse.data) {
    const mappedResponse = mapBusinessDetails(dalResponse.data)

    return mappedResponse
  }

  return dalResponse
}

export {
  fetchBusinessDetailsService
}
