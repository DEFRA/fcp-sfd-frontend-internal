/**
 * Creates the application logger
 *
 * @module createLogger
 */

import { pino } from 'pino'

import { loggerOptions } from '../config/logger-options.js'

/**
 * @returns {object} A Pino logger configured with the application logger options
 */
export const createLogger = () => {
  return pino(loggerOptions)
}
