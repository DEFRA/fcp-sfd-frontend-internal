import { config } from '../../config/index.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'

export const auth = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const useFederated = config.get('featureToggle.useFederatedCredentials')
      if (useFederated) {
        // Federated credentials strategy will be added in a follow-up PR
        throw new Error('Federated credentials not yet implemented. Set USE_FEDERATED_CREDENTIALS=false')
      } else {
        await registerClientSecretStrategy(server)
      }
    }
  }
}
