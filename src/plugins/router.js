/**
 * Registers the application routes
 *
 * @module router
 */

import inert from '@hapi/inert'

import { routes } from '../routes/routes.js'

/**
 * Also registers the inert plugin so static files can be served.
 *
 * @param {object} server - The Hapi server
 *
 * @returns {Promise<void>}
 */
const register = async (server) => {
  await server.register([inert])
  server.route(routes)
}

export const router = {
  plugin: {
    name: 'router',
    register
  }
}
