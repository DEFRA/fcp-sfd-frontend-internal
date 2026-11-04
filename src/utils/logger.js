/**
 * Creates the application logger
 *
 * @module logger
 */

import { pino } from 'pino'

import { loggerOptions } from '../config/logger-options.js'

/**
 * Creates the application logger
 *
 * @returns {object} A Pino logger configured with the application logger options
 */
export const createLogger = () => {
  return pino(loggerOptions)
}
