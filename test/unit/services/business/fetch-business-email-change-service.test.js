// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details'

// Thing under test
import { fetchBusinessEmailChangeService } from '../../../../src/services/business/fetch-business-email-change-service.js'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

describe('fetchBusinessEmailChangeService', () => {
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
    describe('and there is no changed email', () => {
      beforeEach(() => {
        fetchBusinessDetailsService.mockResolvedValue(data)
      })

      test('it returns the correct data', async () => {
        const result = await fetchBusinessEmailChangeService(yar, credentials)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
        expect(yar.set).toHaveBeenCalledWith('businessDetails', { ...data, changeBusinessEmail: 'henleyrej@eryelnehk.com.test' })
        expect(result).toEqual({ ...data, changeBusinessEmail: 'henleyrej@eryelnehk.com.test' })
      })
    })

    describe('and there is a changed email', () => {
      beforeEach(() => {
        const newEmail = 'new-email@new-email.com'

        mappedData.changeBusinessEmail = newEmail
        data.changeBusinessEmail = newEmail

        fetchBusinessDetailsService.mockResolvedValue(mappedData)
      })

      test('it returns the correct data', async () => {
        const result = await fetchBusinessEmailChangeService(yar, credentials)

        expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
        expect(yar.set).toHaveBeenCalledWith('businessDetails', data)
        expect(result).toEqual(data)
      })
    })
  })
})
