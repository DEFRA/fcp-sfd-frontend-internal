import { constants } from 'node:http2'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { SCOPE } from '../../../../../src/constants/scope/business-details.js'
import '../../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_OK, HTTP_STATUS_FOUND } = constants

vi.mock('../../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

const { fetchBusinessDetailsService } = await import('../../../../../src/services/business/fetch-business-details-service.js')
const { createServer } = await import('../../../../../src/server.js')

describe('business details route', () => {
  const sbi = '106705779'
  const path = `/business/${sbi}/details`
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

  describe('GET /business/{sbi}/details', () => {
    test('returns 200 and renders the business details view when authenticated', async () => {
      fetchBusinessDetailsService.mockResolvedValue({
        info: {
          sbi,
          businessName: 'Herberts Lawn Mowing',
          vat: null,
          traderNumber: null,
          vendorNumber: null,
          legalStatus: 'Sole Proprietorship',
          type: 'Not Specified',
          countyParishHoldingNumbers: []
        },
        address: { lookup: {}, manual: {}, postcode: null, country: null },
        contact: { email: null, landline: null, mobile: null }
      })

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
      expect(response.request.response.source.template).toBe('business/business-details')
    })

    test('redirects to /auth/sign-in when not authenticated', async () => {
      const response = await server.inject({
        method: 'GET',
        url: path
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/auth/sign-in?redirect=${path}`)
    })
  })
})
