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

/**
 * CRN (Customer Reference Number) masking for secure logging.
 *
 * CRN is half of a login credential and must never be logged in full. Only the last
 * 4 digits are visible; the rest are replaced with asterisks.
 *
 * Request lifecycle and logging:
 *
 * 1. User makes HTTP request (e.g., GET `/customer/1100014934/details`)
 *
 * 2. hapi-pino's `onRequest` extension fires (BEFORE route matching):
 *    - Creates a child logger for this request
 *    - Calls `req` serializer → masks URL path via maskSensitivePath() using regex
 *    - Log object includes masked URL: `/customer/******4934/details`
 *    - At this point, request.params is still empty `{}` — routing hasn't happened yet
 *
 * 3. Hapi matches the route (now request.params is populated):
 *    - request.params.crn becomes `"1100014934"`
 *    - But hapi-pino's serializer already ran in step 2, so this doesn't affect the
 *      URL field masking (which happened via regex on the path string)
 *
 * 4. Route handler executes and builds response
 *
 * 5. Response is sent:
 *    - customRequestCompleteMessage() builds final message string
 *    - Calls maskSensitivePath() again on the URL
 *    - Creates message: `"[response] GET /customer/******4934/details 200 (45ms)"`
 *
 * 6. Final log serialization (in production):
 *    - serializers.request() runs with now-populated request.params
 *    - Calls maskSensitiveParams() to mask params.crn field
 *    - Structured log has masked CRN in both url field AND params.crn field
 *
 * 7. Log sent to stdout/Elasticsearch:
 *    - CRN fully masked everywhere: message, url, params
 *
 * Architecture: URL-based masking (not params-based) is necessary because the req
 * serializer runs during onRequest, before route matching. The regex approach
 * (maskSensitivePath) ensures CRN is masked at the earliest possible point, using
 * the URL path string shape instead of waiting for request.params to be populated.
 */

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

// hapi-pino builds the child logger during the 'onRequest' extension, before routing has
// run, so request.params is always empty at that point — match on the URL shape instead
const CRN_PATH_SEGMENT = /^\/customer\/([^/]+)/

const maskSensitivePath = (path) => {
  const match = CRN_PATH_SEGMENT.exec(path)
  if (!match) {
    return path // No CRN route, return path unchanged
  }

  // Destructuring: skip [0], grab [1] (the CRN value)
  const [, crn] = match

  // Replace CRN with masked version
  return path.replace(crn, maskValue(crn))
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
  return `[response] ${request.method} ${maskSensitivePath(request.path)} ${statusCode} (${responseTime}ms)`
}

export const loggerOptions = {
  enabled: logConfig.enabled,
  ignorePaths: isLocal ? ['/health', '/public', '/favicon.ico'] : ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  // Receive the raw hapi request in serializers so req.path/req.params are available to mask
  wrapSerializers: false,
  customRequestCompleteMessage: requestCompleteMessage,
  serializers: isLocal
    ? {
        // Local development logger settings
        req: req => ({
          method: req.method,
          url: maskSensitivePath(req.path)
        }),
        res: res => ({
          statusCode: res.statusCode
        })
      }
    : {
        req: req => ({
          method: req.method,
          url: maskSensitivePath(req.path),
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
