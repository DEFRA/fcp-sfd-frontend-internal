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

vi.mock('../../../../../src/services/business/update-business-vat-remove-service.js', () => ({
  updateBusinessVatRemoveService: vi.fn()
}))

const { fetchBusinessChangeService } = await import('../../../../../src/services/business/fetch-business-change-service.js')
const { updateBusinessVatRemoveService } = await import('../../../../../src/services/business/update-business-vat-remove-service.js')
const { createServer } = await import('../../../../../src/server.js')

describe('business VAT remove route', () => {
  const sbi = '106705779'
  const path = `/business/${sbi}/business-vat-registration-remove`
  const credentials = { sessionId: 'session-id' }
  const businessDetails = { info: { sbi, businessName: 'Herberts Lawn Mowing', vat: 'GB123456789' } }
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
    fetchBusinessChangeService.mockResolvedValue(businessDetails)

    const response = await server.inject({
      url: path,
      auth: { strategy: 'session', credentials }
    })

    const setCookies = [].concat(response.headers['set-cookie'] ?? [])
    const crumbCookie = setCookies.find((cookie) => cookie.startsWith('crumb='))
    const crumbValue = crumbCookie.split(';')[0].split('=')[1]

    return { crumbValue, cookie: `crumb=${crumbValue}` }
  }

  describe('GET /business/{sbi}/business-vat-registration-remove', () => {
    test('returns 200 and renders the business VAT remove view when authenticated', async () => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)

      const response = await server.inject({
        url: path,
        auth: { strategy: 'session', credentials }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_OK)
      expect(response.request.response.source.template).toBe('business/business-vat-registration-remove')
    })

    test('renders the question as the fieldset legend so the radio group has an accessible name', async () => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)

      const response = await server.inject({
        url: path,
        auth: { strategy: 'session', credentials }
      })

      expect(response.payload).toContain('<legend class="govuk-fieldset__legend govuk-fieldset__legend--l">')
      expect(response.payload).toContain('Are you sure you want to remove your VAT registration number?')
    })

    test('renders the first radio with the id the error summary links to', async () => {
      fetchBusinessChangeService.mockResolvedValue(businessDetails)

      const response = await server.inject({
        url: path,
        auth: { strategy: 'session', credentials }
      })

      expect(response.payload).toContain('id="confirmRemove"')
    })
  })

  describe('POST /business/{sbi}/business-vat-registration-remove', () => {
    test('is rejected with 403 when the CSRF crumb is missing', async () => {
      const response = await server.inject({
        method: 'POST',
        url: path,
        payload: { confirmRemove: 'yes' },
        auth: { strategy: 'session', credentials }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FORBIDDEN)
    })

    test('removes the VAT number and redirects to the business details page when "yes" is selected', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { confirmRemove: 'yes', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/business/${sbi}/details`)
      expect(updateBusinessVatRemoveService).toHaveBeenCalled()
    })

    test('redirects to the business details page without removing anything when "no" is selected', async () => {
      updateBusinessVatRemoveService.mockClear()

      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { confirmRemove: 'no', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_FOUND)
      expect(response.headers.location).toBe(`/business/${sbi}/details`)
      expect(updateBusinessVatRemoveService).not.toHaveBeenCalled()
    })

    test('re-renders the view with a working error summary link when nothing is selected', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
      expect(response.request.response.source.template).toBe('business/business-vat-registration-remove')
      expect(response.payload).toContain('Select yes if you want to remove your VAT registration number')
      expect(response.payload).toContain('href="#confirmRemove"')
      expect(response.payload).toContain('id="confirmRemove"')
    })

    test('replays the submitted selection when the value is invalid', async () => {
      const { crumbValue, cookie } = await getCrumb()

      const response = await server.inject({
        method: 'POST',
        url: path,
        headers: { cookie },
        auth: { strategy: 'session', credentials },
        payload: { confirmRemove: 'no', vatNumber: 'unexpected', crumb: crumbValue }
      })

      expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
      expect(response.request.response.source.context.confirmRemove).toBe('no')
    })
  })
})
