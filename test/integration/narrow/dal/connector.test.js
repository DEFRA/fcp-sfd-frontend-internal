import { vi, describe, test, expect, beforeAll, afterAll } from 'vitest'
import { dalConnector } from '../../../../src/dal/connector.js'
import { exampleQuery } from '../../../../src/dal/queries/example-query.js'

const mockOidcConfig = {
  authorization_endpoint: 'https://oidc.example.com/authorize',
  token_endpoint: 'https://oidc.example.com/token',
  end_session_endpoint: 'https://oidc.example.com/logout',
  jwks_uri: 'https://oidc.example.com/jwks'
}

vi.mock('../../../../src/auth/get-oidc-config.js', async () => {
  return {
    getOidcConfig: async () => (mockOidcConfig)
  }
})

vi.mock('../../../../src/services/DAL/token/get-token-service.js', async () => {
  return {
    getTokenService: vi.fn(async () => 'mock-bearer-token')
  }
})

const { createServer } = await import('../../../../src/server.js')
const { config } = await import('../../../../src/config/index.js')

describe('Data access layer (DAL) connector integration', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('should successfully call DAL and return data', async () => {
    const result = await dalConnector(
      exampleQuery,
      {
        sbi: '107183280',
        crn: '9477368292'
      }
    )

    expect(result.data).toBeDefined()
    expect(result.errors).toBeNull()
    expect(result.statusCode).toBe(200)
  })

  test('should handle network errors by setting config directly', async () => {
    const originalEndpoint = config.get('dalConfig.endpoint')

    try {
      config.set('dalConfig.endpoint', 'http://nonexistent-domain-12345.invalid/graphql')

      const result = await dalConnector(exampleQuery, { sbi: 107591843 }, 'test.user11@defra.gov.uk')

      expect(result.data).toBeNull()
      expect(result.errors).toBeDefined()
      expect(result).toHaveProperty('statusCode', 500)
    } finally {
      config.set('dalConfig.endpoint', originalEndpoint)
    }
  })

  test('should handle invalid GraphQL query syntax as bad request (400) error', async () => {
    const invalidQuery = `
      query Business($sbi: ID!) {
        business(sbi: $sbi) {
          sbi
          invalidSyntax {{{
      }
    `

    const result = await dalConnector(invalidQuery, { sbi: 107591843 }, 'test.user11@defra.gov.uk')

    expect(result.data).toBeNull()
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toBe('Syntax Error: Expected Name, found "{".')
    expect(result.statusCode).toBe(400)
  })

  test('should handle missing required query params as bad request (400) error', async () => {
    const result = await dalConnector(exampleQuery, {}, 'test.user11@defra.gov.uk')

    expect(result.data).toBeNull()
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toBe('Variable "$sbi" of required type "ID!" was not provided.')
    expect(result.statusCode).toBe(400)
  })
})
