// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Things we need to mock
const mockDalConnector = { query: vi.fn() }

vi.mock('../../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

describe('updateDalService', () => {
  const mutation = 'updateBusinessName'
  const variables = { input: { name: 'Amazing Business Ltd', sbi: '123456789' } }
  const responseData = {
    data: {
      updateBusinessName: {
        sbi: '123456789',
        name: 'Amazing Business Ltd'
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when dalConnector resolves successfully', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue(responseData)
    })

    test('it calls dalConnector with the correct arguments', async () => {
      await updateDalService(mutation, variables, 'test@example.com')

      expect(mockDalConnector.query).toHaveBeenCalledTimes(1)
      expect(mockDalConnector.query).toHaveBeenCalledWith(mutation, variables, 'test@example.com')
    })

    test('it returns the DAL response', async () => {
      const result = await updateDalService(mutation, variables, 'test@example.com')

      expect(result).toEqual(responseData)
    })
  })

  describe('when dalConnector returns an error', () => {
    beforeEach(() => {
      mockDalConnector.query.mockResolvedValue({
        data: null,
        errors: ['Some DAL error'],
        statusCode: 500
      })
    })

    test('it throws when DAL response includes errors', async () => {
      await expect(updateDalService(mutation, variables, 'test@example.com')).rejects.toThrow('DAL error from mutation')
    })
  })
})
