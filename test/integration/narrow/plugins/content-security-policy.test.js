import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest'
import '../../../mocks/setup-server-mocks.js'

const { createServer } = await import('../../../../src/server.js')

let server

describe('content security policy', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('should include content security policy header', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['content-security-policy']).toBeDefined()
  })
})
