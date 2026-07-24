import { constants } from 'node:http2'
import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import '../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_OK, HTTP_STATUS_BAD_REQUEST } = constants

const { createServer } = await import('../../../../src/server.js')

describe('Error: page title prefix (layout.njk)', () => {
  const path = '/search-sbi'
  const credentials = { sessionId: 'session-id', scope: [] }
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

  // The crumb (CSRF) cookie is issued on a GET and must be echoed back on the POST.
  const getCrumb = async () => {
    const response = await server.inject({
      method: 'GET',
      url: path,
      auth: { strategy: 'session', credentials }
    })

    const setCookies = [].concat(response.headers['set-cookie'] ?? [])
    const crumbCookie = setCookies.find((cookie) => cookie.startsWith('crumb='))
    const crumbValue = crumbCookie.split(';')[0].split('=')[1]

    return { crumbValue, cookie: `crumb=${crumbValue}` }
  }

  describe('when the page renders with validation errors', () => {
    test('it prefixes the page title with "Error: "', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        auth: { strategy: 'session', credentials },
        headers: { cookie },
        payload: { sbi: 'not-a-valid-sbi', crumb: crumbValue }
      })

      const title = response.payload.match(/<title>([\s\S]*?)<\/title>/)[1].trim()

      expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
      expect(title.startsWith('Error: ')).toBe(true)
    })
  })

  describe('when the page renders without validation errors', () => {
    test('it does not prefix the page title with "Error: "', async () => {
      const response = await server.inject({
        method: 'GET',
        url: path,
        auth: { strategy: 'session', credentials }
      })

      const title = response.payload.match(/<title>([\s\S]*?)<\/title>/)[1].trim()

      expect(response.statusCode).toBe(HTTP_STATUS_OK)
      expect(title.startsWith('Error: ')).toBe(false)
    })
  })
})
