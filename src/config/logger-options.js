import { ecsFormat } from '@elastic/ecs-pino-format'
import { getTraceId } from '@defra/hapi-tracing'
import { config } from './index.js'
const isLocal = config.get('server.isDevelopment')

const logConfig = config.get('server.log')
const serviceName = config.get('server.serviceName')
const serviceVersion = config.get('server.serviceVersion')

const formatters = {
  ecs: {
    ...ecsFormat({
      serviceVersion,
      serviceName
    })
  },
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}

// CRN is half of a login credential, so only the last 4 digits may be logged
const VISIBLE_CHAR_COUNT = 4

const maskValue = (value) => {
  if (!value || value.length <= VISIBLE_CHAR_COUNT) {
    return '****'
  }

  const asteriskCount = value.length - VISIBLE_CHAR_COUNT
  const asterisks = '*'.repeat(asteriskCount)
  const visibleChars = value.slice(-VISIBLE_CHAR_COUNT)

  return asterisks + visibleChars
}

const maskSensitivePath = (path, params) => {
  // params can be null (not just undefined) e.g. on unmatched routes, so guard explicitly
  if (params?.crn) {
    const maskedCrn = maskValue(params.crn)

    return path.replaceAll(params.crn, maskedCrn)
  }

  return path
}

const maskSensitiveParams = (params) => {
  // Create a copy of params so we don't modify the original
  const maskedParams = { ...params }

  // If there's a CRN, mask it
  if (maskedParams.crn) {
    maskedParams.crn = maskValue(maskedParams.crn)
  }

  return maskedParams
}

// Mask CRN in the response completion message so it doesn't leak there
const requestCompleteMessage = (request, responseTime) => {
  const statusCode = request.raw.res.headersSent ? request.raw.res.statusCode : '-'
  return `[response] ${request.method} ${maskSensitivePath(request.path, request.params)} ${statusCode} (${responseTime}ms)`
}

export const loggerOptions = {
  enabled: logConfig.enabled,
  ignorePaths: isLocal ? ['/health', '/public', '/favicon.ico'] : ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  // Receive the raw hapi request in serializers so route params are available to mask
  wrapSerializers: false,
  customRequestCompleteMessage: requestCompleteMessage,
  serializers: isLocal
    ? {
        // Local development logger settings
        req: req => ({
          method: req.method,
          url: maskSensitivePath(req.path, req.params)
        }),
        res: res => ({
          statusCode: res.statusCode
        })
      }
    : {
        req: req => ({
          method: req.method,
          url: maskSensitivePath(req.path, req.params),
          params: maskSensitiveParams(req.params)
        })
      },
  ...formatters[logConfig.format],
  nesting: true,
  mixin: () => {
    const mixinValues = {}
    const traceId = getTraceId()
    if (traceId) {
      mixinValues.trace = { id: traceId }
    }
    return mixinValues
  }
}
