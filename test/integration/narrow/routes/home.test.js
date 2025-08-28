import { constants } from 'node:http2'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { SCOPE } from '../../../../src/constants/scope/business-details.js'
import '../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = constants

const { createServer } = await import('../../../../src/server.js')

let server

describe('index route', () => {
  beforeAll(async () => {
    vi.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('GET / returns index view', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_OK)
    expect(response.request.response.source.template).toBe('index')
  })
})

describe('home route', () => {
  const path = '/home'

  beforeAll(async () => {
    vi.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('GET /home returns index view if authenticated and has "user" scope', async () => {
    const response = await server.inject({
      url: path,
      auth: {
        strategy: 'session',
        credentials: {
          sessionId: 'session-id',
          scope: SCOPE
        }
      }
    })
    expect(response.statusCode).toBe(HTTP_STATUS_OK)
    expect(response.request.response.source.template).toBe('home')
  })

  test('GET /home redirects to /auth/sign-in if not authenticated', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/home'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
    expect(response.headers.location).toBe('/auth/sign-in?redirect=/home')
  })
})
