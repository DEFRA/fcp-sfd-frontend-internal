/**
 * Creates the cache used to store tokens for DAL requests
 *
 * @module tokenCache
 */

import { config } from '../../config/index.js'

/**
 * Creates the cache used to store tokens for DAL requests
 *
 * @param {object} server - The Hapi server
 * @param {string} cacheName - The name of the server cache to use
 *
 * @returns {object} The Catbox policy for the token cache
 */
export const initTokenCache = (server, cacheName) => {
  return server.cache({
    cache: cacheName,
    segment: config.get('server.session.cache.tokenSegment'),
    expiresIn: config.get('redis.ttl')
  })
}
