/**
 * Wrapper service that calls the OS Places address lookup service from the frontend engine.
 *
 * This wrapper:
 * - Gets the OS Places configuration from the application config
 * - Calls the engine's addressLookupService with the configuration
 * - Logs any errors for observability
 * - Handles session storage of the returned addresses
 * - Maintains backward compatibility with existing route handlers
 *
 * @module addressLookupService
 */

import { config } from '../../config/index.js'
import { createLogger } from '../../utils/logger.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { services } from '@defra/fcp-sfd-frontend-engine'

const logger = createLogger()

/**
 * Fetch and store addresses from OS Places API based on postcode.
 *
 * @param {string} postcode - The UK postcode to search for
 * @param {object} yar - Hapi yar session object
 * @param {string} context - Context identifier ('business' or 'personal')
 * @returns {Promise<Array|object>} Array of addresses or error object
 */
const addressLookupService = async (postcode, yar, context) => {
  const osPlacesConfig = config.get('osPlacesConfig')
  const addresses = await services.addressLookup(postcode, osPlacesConfig)

  // Log and return early if there are errors
  if (addresses.error) {
    logger.error(addresses.error?.[0]?.message || 'Unknown error', 'Error connecting to OS Places API')
    return addresses
  }

  // Store the addresses in the session for later retrieval
  const changeAddress = context === 'business' ? 'changeBusinessAddresses' : 'changePersonalAddresses'
  setSessionData(yar, `${context}DetailsUpdate`, `${changeAddress}`, addresses)

  return addresses
}

export {
  addressLookupService
}
