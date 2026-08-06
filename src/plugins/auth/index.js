import { config } from '../../config/index.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'

export const auth = {
  plugin: {
    name: 'auth',
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
