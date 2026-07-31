import { constants } from 'node:http2'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import '../../../../mocks/setup-server-mocks.js'

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_FORBIDDEN
} = constants

vi.mock('../../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

const { fetchBusinessChangeService } = await import('../../../../../src/services/business/fetch-business-change-service.js')
const { createServer } = await import('../../../../../src/server.js')

describe('business phone numbers change route', () => {
  const sbi = '106705779'
  const path = `/business/${sbi}/business-phone-numbers-change`
  const credentials = { sessionId: 'session-id' }
  let server

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

  // The crumb (CSRF) cookie is issued on a GET and must be echoed back on the POST.
  const getCrumb = async () => {
    fetchBusinessChangeService.mockResolvedValue({
      info: { sbi, businessName: 'Herberts Lawn Mowing' },
      contact: { landline: '01234 567891', mobile: null }
    })

    const response = await server.inject({
      url: path,
      auth: { strategy: 'session', credentials }
    })

    const setCookies = [].concat(response.headers['set-cookie'] ?? [])
    const crumbCookie = setCookies.find((cookie) => cookie.startsWith('crumb='))
    const crumbValue = crumbCookie.split(';')[0].split('=')[1]

    return { crumbValue, cookie: `crumb=${crumbValue}` }
  }

  describe('GET /business/{sbi}/business-phone-numbers-change', () => {
    test('returns 200 and renders the business phone numbers change view when authenticated', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi, businessName: 'Herberts Lawn Mowing' },
        contact: { landline: '01234 567891', mobile: null }
      })

      const response = await server.inject({
        url: path,
        auth: { strategy: 'session', credentials }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_OK)
      expect(response.request.response.source.template).toBe('business/business-phone-numbers-change')
    })
  })

  describe('POST /business/{sbi}/business-phone-numbers-change', () => {
    test('is rejected with 403 when the CSRF crumb is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: path,
        payload: { businessTelephone: '01234 567891', businessMobile: '07777 123456' },
        auth: { strategy: 'session', credentials }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FORBIDDEN)
    })

    test('redirects to the business details page when both numbers are provided', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { businessTelephone: '01234 567891', businessMobile: '07777 123456', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/business/${sbi}/details`)
    })

    test('redirects to the business details page when only the mobile is provided', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { businessTelephone: '', businessMobile: '07777 123456', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/business/${sbi}/details`)
    })

    test('redirects to the business details page when only the telephone is provided', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { businessTelephone: '01234 567891', businessMobile: '', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/business/${sbi}/details`)
    })

    test('re-renders the view with errors when neither number is provided', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { businessTelephone: '', businessMobile: '', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
      expect(response.request.response.source.template).toBe('business/business-phone-numbers-change')
      expect(response.payload).toContain('Enter at least one phone number')
    })

    test('re-renders the view with errors and replays the payload when a number is invalid', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { businessTelephone: 'not-a-number', businessMobile: '', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
      expect(response.request.response.source.context.businessTelephone).toBe('not-a-number')
    })
  })
})
