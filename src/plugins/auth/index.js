import { config } from '../../config/index.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'

/**
 * Only the client secret strategy is supported at the moment.
 *
 * @param {object} server - The Hapi server
 *
 * @returns {Promise<void>}
 */
const register = async (server) => {
  const useFederated = config.get('featureToggle.useFederatedCredentials')
  if (useFederated) {
    server?.logger?.warn(
      'Federated credentials requested but not yet implemented. Using client-secret strategy.'
    )
  }
  await registerClientSecretStrategy(server)
}

/**
 * Hapi plugin that registers the sign in strategies
 */
export const auth = {
  plugin: {
    name: 'auth',
    register
  }
}
