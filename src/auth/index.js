import { registerClientSecretStrategy } from './strategies/client-secret.js'

export const auth = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      await registerClientSecretStrategy(server)
    }
  }
}
