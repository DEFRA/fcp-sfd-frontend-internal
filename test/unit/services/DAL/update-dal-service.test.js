// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing we need to mock
import { dalConnector } from '../../../../src/dal/connector.js'

// Thing under test
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Mocks
vi.mock('../../../../src/dal/connector.js', () => ({
  dalConnector: vi.fn()
}))

describe('updateDalService', () => {
  const mutation = 'updateBusinessName'
  const variables = { input: { name: 'Amazing Business Ltd', sbi: '123456789' } }
  let responseData

  beforeEach(() => {
    vi.clearAllMocks()
    responseData = {
      data: {
        updateBusinessName: {
          sbi: '123456789',
          name: 'Amazing Business Ltd'
        }
      }
    }
  })

  describe('when dalConnector resolves successfully', () => {
    beforeEach(() => {
      dalConnector.mockResolvedValue(responseData)
    })

    test('it calls dalConnector with the correct arguments', async () => {
      await updateDalService(mutation, variables)

      expect(dalConnector).toHaveBeenCalledWith(mutation, variables)
    })

    test('it returns the DAL response', async () => {
      const result = await updateDalService(mutation, variables)

      expect(result).toEqual(responseData)
    })
  })

  describe('when dalConnector returns an error', () => {
    beforeEach(() => {
      dalConnector.mockResolvedValue({ errors: ['Some DAL error'] })
    })

    test('it throws an error', async () => {
      await expect(updateDalService(mutation, variables)).rejects.toThrow('DAL error from mutation')
    })
  })
})
