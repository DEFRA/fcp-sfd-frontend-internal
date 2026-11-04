/**
 * Registers the application routes
 *
 * @module router
 */

import inert from '@hapi/inert'

import { routes } from '../routes/routes.js'

export const router = {
  plugin: {
    name: 'router',

    /**
     * Registers the application routes
     *
     * Also registers the inert plugin so static files can be served.
     *
     * @param {object} server - The Hapi server
     *
     * @returns {Promise<void>}
     */
    async register (server) {
      await server.register([inert])
      server.route(routes)
    }
  }
}
