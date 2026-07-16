import { config } from '../../config/index.js'
import { clientSecretRoutes } from './client-secret-routes.js'
import { federatedRoutes } from './federated-routes.js'

const useFederated = config.get('featureToggle.useFederatedCredentials')

export const auth = useFederated ? federatedRoutes : clientSecretRoutes
