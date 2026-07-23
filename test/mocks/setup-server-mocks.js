import { vi } from 'vitest'

const mockOidcConfig = {
  authorization_endpoint: 'https://oidc.example.com/authorize',
  token_endpoint: 'https://oidc.example.com/token',
  end_session_endpoint: 'https://oidc.example.com/logout',
  jwks_uri: 'https://oidc.example.com/jwks'
}

const mockAccessToken = 'testAccessToken'

// Mock constructors for @defra/hapi-auth-oidc providers.
// These are called as `new MockProvider({})` and `new WebIdentityTokenProvider({ audience })`
// in federated-credentials.js. Using vi.fn() allows them to be instantiated in tests.
const mockConstructor = vi.fn()

vi.mock('@hapi/catbox-redis', async () => {
  const CatboxMemory = await import('@hapi/catbox-memory')
  return CatboxMemory
})

vi.mock('../../src/auth/get-oidc-config.js', async () => {
  return {
    getOidcConfig: async () => (mockOidcConfig)
  }
})

vi.mock('@defra/hapi-auth-oidc', () => {
  return {
    hapiAuthOidcPlugin: {
      name: 'hapi-auth-oidc-mock',
      version: '1.0.0',
      register: async (server, _options) => {
        // Add mock decorations to the request object for OIDC flow
        server.decorate('request', 'login', async function (h) {
          // Mock login handler - return a 302 redirect to authorization endpoint
          return h.redirect('https://oidc.example.com/authorize?client_id=test-client-id&redirect_uri=http://localhost/auth/callback&response_type=code&scope=openid')
        })

        server.decorate('request', 'callback', async function () {
          // Mock callback handler
          return {
            tokens: {
              access_token: mockAccessToken,
              refresh_token: 'mock-refresh-token'
            }
          }
        })

        server.decorate('request', 'ensureValidToken', async function (token) {
          // Mock token validation
          return token
        })
      }
    },
    WebIdentityTokenProvider: mockConstructor,
    MockProvider: mockConstructor
  }
})

export { mockOidcConfig }
