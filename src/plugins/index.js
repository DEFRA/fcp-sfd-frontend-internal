import Crumb from '@hapi/crumb'
import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'
import Scooter from '@hapi/scooter'
import { csp } from './content-security-policy.js'
import { errors } from './errors.js'
import { headersPlugin } from './headers.js'
import { auth } from './auth.js'
import { vision } from './template-renderer/vision.js'
import { requestLogger } from './request-logger.js'
import { secureContext } from './secure-context/secure-context.js'
import { requestTracing } from './request-tracing.js'
import { router } from './router.js'
import { pulse } from './pulse.js'
import { session } from './session.js'

export const plugins = [
  Crumb,
  Bell,
  Cookie,
  Scooter,
  csp,
  auth,
  session,
  headersPlugin,
  errors,
  requestLogger,
  requestTracing,
  secureContext,
  pulse,
  vision,
  router
]
