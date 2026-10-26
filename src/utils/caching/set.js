/**
 * Stores an item in the cache
 *
 * Sets a specific key in the cache store (e.g. Redis) by calling `set` on the given cache client. The value will
 * automatically expire after the configured ttl (time-to-live).
 *
 * @module set
 */

/**
 * Stores an item in the cache
 *
 * @param {string} key - The cache key
 * @param {*} value - The value to store
 * @param {number} expiresAt - How long the item should live in the cache, in milliseconds
 * @param {object} cache - The cache client, for example from `getCache()`
 *
 * @returns {Promise<void>}
 */
const set = async (key, value, expiresAt, cache) => {
  await cache.set(key, value, expiresAt)
}

export { set }
