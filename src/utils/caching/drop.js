/**
 * Removes an item from the cache
 *
 * Deletes a specific key from the cache store (e.g. Redis) by calling `drop` on the given cache client.
 *
 * @module drop
 */

/**
 * Removes an item from the cache
 *
 * @param {string} key - The cache key
 * @param {object} cache - The cache client, for example from `getCache()`
 *
 * @returns {Promise<void>}
 */
const drop = async (key, cache) => {
  await cache.drop(key)
}

export { drop }
