import { config } from '../config/index.js'
import { tracing } from '@defra/hapi-tracing'

export const requestTracing = {
  plugin: tracing.plugin,
  options: { tracingHeader: config.get('server.tracing.header') }
}
