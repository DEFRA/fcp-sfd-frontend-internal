/**
 * Creates the Redis client, as a single instance or a cluster
 *
 * @module redisClient
 */

import { Cluster, Redis } from 'ioredis'

import { createLogger } from '../logger.js'

/**
 * Creates the Redis client, as a single instance or a cluster
 *
 * Credentials are only used when a username is configured, and TLS only when enabled in the config.
 *
 * @param {object} redisConfig - The Redis config
 * @param {string} redisConfig.host - The Redis host
 * @param {string} redisConfig.keyPrefix - The prefix applied to all keys
 * @param {string} redisConfig.username - The username, empty if none is required
 * @param {string} redisConfig.password - The password
 * @param {boolean} redisConfig.useTLS - Whether to connect using TLS
 * @param {boolean} redisConfig.useSingleInstanceCache - Whether to use a single instance rather than a cluster
 *
 * @returns {object} The Redis or Cluster client
 */
export const buildRedisClient = (redisConfig) => {
  const logger = createLogger()
  const port = 6379
  const db = 0
  const keyPrefix = redisConfig.keyPrefix
  const host = redisConfig.host
  let redisClient

  const credentials =
    redisConfig.username === ''
      ? {}
      : {
          username: redisConfig.username,
          password: redisConfig.password
        }
  const tls = redisConfig.useTLS ? { tls: {} } : {}

  if (redisConfig.useSingleInstanceCache) {
    redisClient = new Redis({
      port,
      host,
      db,
      keyPrefix,
      enableReadyCheck: false,
      ...credentials,
      ...tls
    })
  } else {
    redisClient = new Cluster(
      [
        {
          host,
          port
        }
      ],
      {
        keyPrefix,
        slotsRefreshTimeout: 10000,
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
          db,
          enableReadyCheck: false,
          ...credentials,
          ...tls
        }
      }
    )
  }

  redisClient.on('connect', () => {
    logger.info('Connected to Redis server')
  })

  redisClient.on('error', (error) => {
    logger.error(`Redis connection error ${error}`)
  })

  return redisClient
}
