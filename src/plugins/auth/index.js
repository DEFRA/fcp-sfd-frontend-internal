import { config } from '../../config/index.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'
import { registerFederatedStrategy } from './strategies/federated-credentials.js'

export const auth = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const useFederated = config.get('featureToggle.useFederatedCredentials')
      if (useFederated) {
        await registerFederatedStrategy(server)
      } else {
        await registerClientSecretStrategy(server)
      }
    }
  }
}
