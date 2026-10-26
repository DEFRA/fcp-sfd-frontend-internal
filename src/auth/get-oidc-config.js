/**
 * Fetches the Entra OpenID Connect configuration
 *
 * @module getOidcConfig
 */

import Wreck from '@hapi/wreck'
import { config } from '../config/index.js'

/**
 * Fetches the Entra OpenID Connect configuration
 *
 * Retrieves the document from the configured well-known URL, which includes the endpoints used for sign out,
 * token refresh and key lookup.
 *
 * @returns {Promise<object>} The OpenID Connect configuration
 */
async function getOidcConfig () {
  const { payload } = await Wreck.get(config.get('entra.wellKnownUrl'), {
    json: true
  })

  return payload
}

export { getOidcConfig }
