import hapiPulse from 'hapi-pulse'
import { createLogger } from '../utils/logger.js'

const tenSeconds = 10 * 1000

export const pulse = {
  plugin: hapiPulse,
  options: {
    logger: createLogger(),
    timeout: tenSeconds
  }
}
