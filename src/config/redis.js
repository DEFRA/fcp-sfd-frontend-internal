import { isProduction } from '../constants/environments.js'
import { DEFAULT_CACHE_TTL_MINUTES } from '../constants/cache-keys.js'

export const redisConfig = {
  redis: {
    host: {
      doc: 'Redis cache host',
      format: String,
      default: 'redis:6379',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'fcp-sfd-frontend-internal:',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Connect to a single instance of redis instead of a cluster.',
      format: Boolean,
      default: !isProduction,
      env: 'USE_SINGLE_INSTANCE_CACHE'
    },
    useTLS: {
      doc: 'Connect to redis using TLS',
      format: Boolean,
      default: isProduction,
      env: 'REDIS_TLS'
    },
    ttl: {
      doc: 'Default cache TTL in milliseconds',
      format: Number,
      default: 1000 * 60 * DEFAULT_CACHE_TTL_MINUTES, // 58 minutes
      env: 'REDIS_TTL'
    }
  }
}
