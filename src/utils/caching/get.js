/**
 * A helper function to retrieve cached items
 *
 * This module exports `get` function that retrieves a specific key from the cache store (e.g Redis). It retrieves
 * the active cache client instance `getCache()` and calls the `get` method to retrieve the key-value pair.
 */
const get = async (key, cache) => {
  return cache.get(key)
}

export { get }
