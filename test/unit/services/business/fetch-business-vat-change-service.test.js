// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details'

// Thing under test
import { fetchBusinessVatChangeService } from '../../../../src/services/business/fetch-business-vat-change-service.js'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('fetchBusinessVatChangeService', () => {
  const data = mappedData
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    yar = {
      set: vi.fn()
    }
    credentials = {
      sbi: '123456789',
      crn: '987654321',
      email: 'test@example.com'
    }
  })

  describe('when called', () => {
    describe('and there is no changed VAT number', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockResolvedValue(data)
      })

      test('it returns the correct data', async () => {
        const result = await fetchBusinessVatChangeService(yar, credentials)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
        expect(yar.set).toHaveBeenCalledWith('businessDetails', { ...data, changeBusinessVat: 'GB123456789' })
        expect(result).toEqual({ ...data, changeBusinessVat: 'GB123456789' })
      })
    })

    describe('and there is a changed VAT number', () => {
      beforeEach(() => {
        const newVatNumber = 'GB987654321'

        mappedData.changeBusinessVat = newVatNumber
        data.changeBusinessVat = newVatNumber

        fetchBusinessDetailsService.mockResolvedValue(mappedData)
      })

      test('it returns the correct data', async () => {
        const result = await fetchBusinessVatChangeService(yar, credentials)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
        expect(yar.set).toHaveBeenCalledWith('businessDetails', data)
        expect(result).toEqual(data)
      })
    })
  })
})
