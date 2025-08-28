import { server } from '../../server.js'

/**
 * A helper function to retrieve active cache instances from the Hapi server
 *
 * This module exports `getCache` function that returns the cache client
 * configured in the Hapi server. In this app the cache is written to Redis
 *
 */
const getCache = () => {
  return server.app.cache
}

export { getCache }
