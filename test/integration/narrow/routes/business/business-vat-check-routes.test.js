import { constants } from 'node:http2'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { SCOPE } from '../../../../../src/constants/scope/business-details.js'
import '../../../../mocks/setup-server-mocks.js'

const { HTTP_STATUS_OK, HTTP_STATUS_FORBIDDEN } = constants

vi.mock('../../../../../src/services/business/fetch-business-change-service.js', () => ({
  fetchBusinessChangeService: vi.fn()
}))

vi.mock('../../../../../src/services/business/update-business-vat-change-service.js', () => ({
  updateBusinessVatChangeService: vi.fn()
}))

const { fetchBusinessChangeService } = await import('../../../../../src/services/business/fetch-business-change-service.js')
const { updateBusinessVatChangeService } = await import('../../../../../src/services/business/update-business-vat-change-service.js')
const { createServer } = await import('../../../../../src/server.js')

describe('business VAT check route', () => {
  const sbi = '106705779'
  const path = `/business/${sbi}/business-vat-registration-number-check`
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

  describe('GET /business/{sbi}/business-vat-registration-number-check', () => {
    test('returns 200 and renders the VAT check view when authenticated', async () => {
      fetchBusinessChangeService.mockResolvedValue({
        info: { sbi, vat: 'GB123456789' },
        changeBusinessVat: 'GB987654321'
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
      expect(response.request.response.source.template).toBe('business/business-vat-registration-number-check')
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-number-check', () => {
    test('is rejected with 403 when the CSRF crumb is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: path,
        payload: {},
        auth: {
          strategy: 'session',
          credentials: {
            sessionId: 'session-id',
            scope: SCOPE
          }
        }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FORBIDDEN)
      expect(updateBusinessVatChangeService).not.toHaveBeenCalled()
    })
  })
})
