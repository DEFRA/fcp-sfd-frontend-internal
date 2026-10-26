/**
 * Starts the Hapi server
 *
 * @module startServer
 */

import { config } from '../config/index.js'

import { createServer } from '../server.js'
import { createLogger } from './logger.js'

/**
 * Starts the Hapi server
 *
 * Failures are logged rather than thrown, in which case the returned server is undefined.
 *
 * @returns {Promise<object|undefined>} The started Hapi server
 */
export const startServer = async () => {
  let server

  try {
    server = await createServer()
    await server.start()

    server.logger.info('Server started successfully')
    server.logger.info(
      `Access your frontend on http://localhost:${config.get('server.port')}`
    )
  } catch (error) {
    const logger = createLogger()
    logger.info('Server failed to start :(')
    logger.error(error)
  }

  return server
}
