/**
 * Returns the active cache client
 *
 * @module getCache
 */

import { server } from '../../server.js'

/**
 * Retrieves the cache configured on the Hapi server. In this app the cache is written to Redis.
 *
 * @returns {object} The Catbox policy for the session cache
 */
const getCache = () => {
  return server.app.cache
}

export { getCache }
