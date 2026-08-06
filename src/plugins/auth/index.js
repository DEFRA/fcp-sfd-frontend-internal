import { config } from '../../config/index.js'
import { createLogger } from '../../utils/logger.js'
import { registerClientSecretStrategy } from './strategies/client-secret.js'
import { registerFederatedStrategy } from './strategies/federated-credentials.js'

const logger = createLogger()

export const auth = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      const useFederated = config.get('featureToggle.useFederatedCredentials')
      if (useFederated) {
        logger.info('[TEST] Registering federated credentials auth strategy')
        await registerFederatedStrategy(server)
      } else {
        logger.info('[TEST] Registering client-secret auth strategy')
        await registerClientSecretStrategy(server)
      }
    }
  }
}
