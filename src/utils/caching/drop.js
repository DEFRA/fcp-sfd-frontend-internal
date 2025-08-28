/**
 * A helper function to removed cached items
 *
 * This module exports `drop` function that deletes a specific key from the cache store (e.g Redis). It retrieves
 * the active cache client instance `getCache()` and calls the `drop` method to remove the key-value pair.
 */
const drop = async (key, cache) => {
  await cache.drop(key)
}

export { drop }
