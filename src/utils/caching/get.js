/**
 * Retrieves an item from the cache
 *
 * Retrieves a specific key from the cache store (e.g. Redis) by calling `get` on the given cache client.
 *
 * @module get
 */

/**
 * Retrieves an item from the cache
 *
 * @param {string} key - The cache key
 * @param {object} cache - The cache client, for example from `getCache()`
 *
 * @returns {Promise<*>} The cached value
 */
const get = async (key, cache) => {
  return cache.get(key)
}

export { get }
