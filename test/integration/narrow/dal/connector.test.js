// Test framework dependencies
import { vi, describe, test, expect, beforeAll, afterAll } from 'vitest'

// Thing under test
import { getDalConnector } from '../../../../src/dal/connector.js'
import { exampleQuery } from '../../../../src/dal/queries/example-query.js'

// Setup
import '../../../mocks/setup-server-mocks.js'
import { createServer } from '../../../../src/server.js'

// Mock dependencies
import { config } from '../../../../src/config/index.js'

vi.mock('../../../../src/services/DAL/token/get-token-service.js', async () => {
  return {
    getTokenService: vi.fn(async () => 'mock-bearer-token')
  }
})

// Test constants
const email = 'testuser01@defra.gov.uk'
const sbi = '300900001'
const crn = '3020000000'
const invalidDalEndpoint = 'http://nonexistent-domain-12345.invalid/graphql'

describe('DAL (data access layer) connector integration', () => {
  let server
  let dalConnector

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    dalConnector = getDalConnector()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  describe('when DAL responds successfully', () => {
    test('should return data without errors and status 200', async () => {
      const result = await dalConnector.query(
        exampleQuery,
        {
          sbi,
          crn
        },
        email
      )

      expect(result.data).toBeDefined()
      expect(result.errors).toBeNull()
      expect(result.statusCode).toBe(200)
    })
  })

  describe('when DAL endpoint is unavailable', () => {
    test('should return 500 error', async () => {
      const originalEndpoint = config.get('dalConfig.endpoint')

      try {
        config.set('dalConfig.endpoint', invalidDalEndpoint)

        const result = await dalConnector.query(
          exampleQuery,
          { sbi },
          email
        )

        expect(result.data).toBeNull()
        expect(result.errors).toBeDefined()
        expect(result.statusCode).toBe(500)
      } finally {
        config.set('dalConfig.endpoint', originalEndpoint)
      }
    })
  })

  describe('when GraphQL query syntax is invalid', () => {
    test('should return 400 error', async () => {
      const invalidQuery = `
        query Business($sbi: ID!) {
          business(sbi: $sbi) {
            sbi
            invalidSyntax {{{
        }
      `

      const result = await dalConnector.query(
        invalidQuery,
        { sbi },
        email
      )

      expect(result.data).toBeNull()
      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toBe('Syntax Error: Expected Name, found "{".')
      expect(result.statusCode).toBe(400)
    })
  })

  describe('when required query variables are missing', () => {
    test('should return 400 error', async () => {
      const result = await dalConnector.query(
        exampleQuery,
        {},
        email
      )

      expect(result.data).toBeNull()
      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toBe('Variable "$sbi" of required type "ID!" was not provided.')
      expect(result.statusCode).toBe(400)
    })
  })
})
