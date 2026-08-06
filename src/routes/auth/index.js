import { config } from '../../config/index.js'
import { clientSecretRoutes } from './client-secret-routes.js'
import { federatedRoutes } from './federated-routes.js'

const useFederated = config.get('featureToggle.useFederatedCredentials')
const authRoutes = useFederated ? federatedRoutes : clientSecretRoutes

export { authRoutes as auth }
