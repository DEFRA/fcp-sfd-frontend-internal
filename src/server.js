import path from 'path'
import hapi from '@hapi/hapi'
import Joi from 'joi'

import { config } from './config/index.js'
import { plugins } from './plugins/index.js'
import { setupProxy } from './utils/setup-proxy.js'
import { catchAll } from './utils/errors.js'
import { getCacheEngine } from './utils/caching/cache-engine.js'

let tokenCache = null

export const createServer = async () => {
  setupProxy()

  const CACHE_NAME = config.get('server.session.cache.name')

  const server = hapi.server({
    port: config.get('server.port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('server.root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: CACHE_NAME,
        engine: getCacheEngine(
          (config.get('server.session.cache.engine'))
        )
      }
    ],
    state: {
      strictHeader: false
    }
  })

  server.app.cache = server.cache({
    cache: CACHE_NAME,
    segment: config.get('server.session.cache.segment'),
    expiresIn: config.get('server.session.cache.ttl')
  })

  // Partition the redis cache to allow tokens to be stored
  server.app.tokenCache = server.cache({
    cache: CACHE_NAME,
    segment: 'tokenCache',
    expiresIn: config.get('redis.ttl')
  })

  tokenCache = server.app.tokenCache

  server.validator(Joi)
  await server.register(plugins)

  server.ext('onPreResponse', catchAll)

  return server
}

// this allows the tokenCache to be imported independent of the server object
export const getTokenCache = () => {
  if (!tokenCache) {
    throw new Error('Token cache is not initialized.')
  }
  return tokenCache
}
