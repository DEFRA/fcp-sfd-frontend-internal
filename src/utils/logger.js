import { pino } from 'pino'

import { loggerOptions } from '../config/logger-options.js'

export const createLogger = () => {
  return pino(loggerOptions)
}
