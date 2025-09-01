/**
 * Returns the `personalDetails` from the session cache if defined,
 * otherwise queries the DAL, maps the response, updates the cache
 * and returns the mapped payload
 *
 * @module fetchPersonalDetailsService
 */

import { dalConnector } from '../../dal/connector.js'
import { personalDetailsQuery } from '../../dal/queries/personal-details.js'
import { mapPersonalDetails } from '../../mappers/personal-details-mapper.js'
import { config } from '../../config/index.js'
import { mappedData } from '../../mock-data/mock-personal-details.js'

const fetchPersonalDetailsService = async (yar, credentials) => {
  const personalDetails = yar.get('personalDetails')

  if (personalDetails) {
    return personalDetails
  }

  const personalDetailsData = config.get('featureToggle.dalConnection') ? await getFromDal(credentials) : mappedData

  yar.set('personalDetails', personalDetailsData)

  return personalDetailsData
}

const getFromDal = async (credentials) => {
  const { sbi, crn } = credentials

  const dalResponse = await dalConnector(personalDetailsQuery, { sbi, crn })

  if (dalResponse.data) {
    const mappedResponse = mapPersonalDetails(dalResponse.data)

    return mappedResponse
  }

  return dalResponse
}

export {
  fetchPersonalDetailsService
}
