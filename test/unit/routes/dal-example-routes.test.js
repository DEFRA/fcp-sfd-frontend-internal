// Test framework dependencies
import { vi, beforeEach, describe, test, expect } from 'vitest'

// Thing under test
import { dalExampleRoutes } from '../../../src/routes/dal-example-routes.js'

// Things we need to mock
const mockDalConnector = { query: vi.fn() }

vi.mock('../../../src/dal/connector.js', () => ({
  getDalConnector: vi.fn(() => mockDalConnector)
}))

const [dalExample] = dalExampleRoutes

describe('DAL Example endpoint', () => {
  let h
  let request

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /dal-example', () => {
    beforeEach(() => {
      h = {
        view: vi.fn().mockReturnValue({})
      }

      request = {
        auth: {
          credentials: {
            email: 'test@example.com'
          }
        }
      }

      mockDalConnector.query.mockResolvedValue(getMockDalResponse())
    })

    test('should have the correct method and path', () => {
      expect(dalExample.method).toBe('GET')
      expect(dalExample.path).toBe('/dal-example')
    })

    test('it calls the dal connector and renders view', async () => {
      await dalExample.handler(request, h)

      expect(mockDalConnector.query).toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('dal-example', { dalData: getMockDalResponse().data })
    })
  })
})

const getMockDalResponse = () => ({
  data: {
    business: {
      sbi: '107167406',
      organisationId: '12345'
    }
  }
})
