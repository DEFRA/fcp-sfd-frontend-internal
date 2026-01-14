import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isProduction, isTest, isDevelopment } from '../constants/environments.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const fourHoursMs = 14400000
const oneWeekMs = 604800000

export const serverConfig = {
  server: {
    serviceVersion: {
      doc: 'The service version, this variable is injected into your docker container in CDP environments',
      format: String,
      nullable: true,
      default: null,
      env: 'SERVICE_VERSION'
    },
    env: {
      doc: 'The application environment',
      format: [
        'production',
        'development',
        'test'
      ],
      default: 'development',
      env: 'NODE_ENV'
    },
    allowErrorViews: {
      doc: 'Allow error views to be rendered',
      format: Boolean,
      default: false,
      env: 'ALLOW_ERROR_VIEWS'
    },
    port: {
      doc: 'The port to bind',
      format: 'port',
      default: 3006,
      env: 'PORT'
    },
    staticCacheTimeout: {
      doc: 'Static cache timeout in milliseconds',
      format: Number,
      default: oneWeekMs,
      env: 'STATIC_CACHE_TIMEOUT'
    },
    serviceName: {
      doc: 'Applications Service Name',
      format: String,
      default: 'Land and farm service'
    },
    root: {
      doc: 'Project root',
      format: String,
      default: path.resolve(dirname, '../..')
    },
    assetPath: {
      doc: 'Asset path',
      format: String,
      default: '/public',
      env: 'ASSET_PATH'
    },
    isProduction: {
      doc: 'If this application running in the production environment',
      format: Boolean,
      default: isProduction
    },
    isDevelopment: {
      doc: 'If this application running in the development environment',
      format: Boolean,
      default: isDevelopment
    },
    isTest: {
      doc: 'If this application running in the test environment',
      format: Boolean,
      default: isTest
    },
    log: {
      enabled: {
        doc: 'Is logging enabled',
        format: Boolean,
        default: !isTest,
        env: 'LOG_ENABLED'
      },
      level: {
        doc: 'Logging level',
        format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
        default: 'info',
        env: 'LOG_LEVEL'
      },
      format: {
        doc: 'Format to output logs in',
        format: ['ecs', 'pino-pretty'],
        default: isProduction ? 'ecs' : 'pino-pretty',
        env: 'LOG_FORMAT'
      },
      redact: {
        doc: 'Log paths to redact',
        format: Array,
        default: isProduction
          ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
          : []
      }
    },
    httpProxy: ({
      doc: 'HTTP Proxy',
      format: String,
      nullable: true,
      default: null,
      env: 'HTTP_PROXY'
    }),
    isSecureContextEnabled: {
      doc: 'Enable Secure Context',
      format: Boolean,
      default: isProduction,
      env: 'ENABLE_SECURE_CONTEXT'
    },
    isMetricsEnabled: {
      doc: 'Enable metrics reporting',
      format: Boolean,
      default: isProduction,
      env: 'ENABLE_METRICS'
    },
    session: {
      cache: {
        engine: {
          doc: 'backend cache is written to',
          format: ['redis', 'memory'],
          default: isProduction ? 'redis' : 'memory',
          env: 'SESSION_CACHE_ENGINE'
        },
        name: {
          doc: 'server side session cache name',
          format: String,
          default: 'session',
          env: 'SESSION_CACHE_NAME'
        },
        segment: {
          doc: 'The cache segment',
          format: String,
          default: 'session'
        },
        tokenSegment: {
          doc: 'The segment of the cache used for storing tokens',
          format: String,
          default: 'tokenCache'
        },
        ttl: {
          doc: 'server side session cache ttl',
          format: Number,
          default: fourHoursMs,
          env: 'SESSION_CACHE_TTL'
        }
      },
      cookie: {
        ttl: {
          doc: 'Session cookie ttl',
          format: Number,
          default: fourHoursMs,
          env: 'SESSION_COOKIE_TTL'
        },
        password: {
          doc: 'session cookie password',
          format: String,
          default: 'the-password-must-be-at-least-32-characters-long',
          env: 'SESSION_COOKIE_PASSWORD',
          sensitive: true
        },
        secure: {
          doc: 'set secure flag on cookie',
          format: Boolean,
          default: isProduction,
          env: 'SESSION_COOKIE_SECURE'
        }
      }
    },
    tracing: {
      header: {
        doc: 'Which header to track',
        format: String,
        default: 'x-cdp-request-id',
        env: 'TRACING_HEADER'
      }
    }
  }
}
