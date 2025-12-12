import { config } from '../../config/index.js'

let tokenCache = null

export const initTokenCache = (server, cacheName) => {
  tokenCache = server.cache({
    cache: cacheName,
    segment: config.get('server.session.cache.tokenSegment'),
    expiresIn: config.get('redis.ttl')
  })
  return tokenCache
}

export const getTokenCache = () => {
  if (!tokenCache) {
    throw new Error('Token cache is not initialized.')
  }
  return tokenCache
}
