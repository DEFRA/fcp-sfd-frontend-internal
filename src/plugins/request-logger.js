/**
 * Hapi plugin for request logging
 *
 * @module requestLogger
 */

import hapiPino from 'hapi-pino'

import { loggerOptions } from '../config/logger-options.js'

export const requestLogger = {
  plugin: hapiPino,
  options: loggerOptions
}
