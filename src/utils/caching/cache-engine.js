/**
 * Creates the Catbox cache engine, using Redis or memory
 *
 * @module cacheEngine
 */

import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { buildRedisClient } from './redis-client.js'
import { config } from '../../config/index.js'
import { createLogger } from '../logger.js'

/**
 * Creates the Catbox cache engine, using Redis or memory
 *
 * Catbox Memory is intended for local development only, so an error is logged if it is used in production.
 *
 * @param {string} engine - The engine to use, either 'redis' or 'memory'
 *
 * @returns {object} The Catbox engine instance
 */
export const getCacheEngine = (engine) => {
  const logger = createLogger()

  if (engine === 'redis') {
    logger.info('Using Redis session cache')
    const redisClient = buildRedisClient(config.get('redis'))
    return new CatboxRedis({ client: redisClient })
  }

  if (config.get('server.isProduction')) {
    logger.error(
      'Catbox Memory is for local development only, it should not be used in production!'
    )
  }

  logger.info('Using Catbox Memory session cache')
  return new CatboxMemory()
}
