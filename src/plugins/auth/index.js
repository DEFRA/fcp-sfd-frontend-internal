/**
 * Registers the authentication strategies
 *
 * @module index
 */

import { config } from '../../config/index.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'

export const auth = {
  plugin: {
    name: 'auth',

    /**
     * Registers the authentication strategies
     *
     * Federated credentials are not yet implemented, so the client secret strategy is always used.
     *
     * @param {object} server - The Hapi server
     *
     * @returns {Promise<void>}
     */
    register: async (server) => {
      const useFederated = config.get('featureToggle.useFederatedCredentials')
      if (useFederated) {
        server?.logger?.warn(
          'Federated credentials requested but not yet implemented. Using client-secret strategy.'
        )
      }
      await registerClientSecretStrategy(server)
    }
  }
}
