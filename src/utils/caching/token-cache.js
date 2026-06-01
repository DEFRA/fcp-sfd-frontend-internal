import { config } from '../../config/index.js'

export const initTokenCache = (server, cacheName) => {
  return server.cache({
    cache: cacheName,
    segment: config.get('server.session.cache.tokenSegment'),
    expiresIn: config.get('redis.ttl')
  })
}
