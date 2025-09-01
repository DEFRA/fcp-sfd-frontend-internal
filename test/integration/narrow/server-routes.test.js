import { vi, describe, test, expect, afterEach } from 'vitest'

const mockOidcConfig = {
  authorization_endpoint: 'https://oidc.example.com/authorize',
  token_endpoint: 'https://oidc.example.com/token',
  end_session_endpoint: 'https://oidc.example.com/logout',
  jwks_uri: 'https://oidc.example.com/jwks'
}

vi.mock('../../../src/auth/get-oidc-config.js', async () => {
  return {
    getOidcConfig: async () => (mockOidcConfig)
  }
})

const { createServer } = await import('../../../src/server.js')

describe('Application Startup Integration Test', () => {
  let server

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('server creates and starts successfully', async () => {
    server = await createServer()
    expect(server).toBeDefined()
    expect(server.info).toBeDefined()

    await server.initialize()
    expect(server.info.created).toBeGreaterThan(0)
    expect(server.info.port).toBe(parseInt(3006))
  })

  test('server has essential functionality', async () => {
    server = await createServer()

    expect(server.views).toBeDefined()
    expect(typeof server.views).toBe('function')
    expect(server.plugins).toBeDefined()
  })
})
