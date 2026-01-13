// Test framework dependencies
import { vi, beforeEach, describe, test, expect } from 'vitest'

// Things we need to mock
import { dalConnector } from '../../../src/dal/connector.js'

// Thing under test
import { dalExampleRoutes } from '../../../src/routes/dal-example-routes.js'
const [dalExample] = dalExampleRoutes

// Mocks
vi.mock('../../../src/dal/connector.js', () => ({
  dalConnector: vi.fn()
}))

vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'featureToggle.dalConnection') {
        return true // Enable DAL connection for this test
      }
      return null
    })
  }
}))

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

      dalConnector.mockResolvedValue(getMockDalResponse())
    })

    test('should have the correct method and path', () => {
      expect(dalExample.method).toBe('GET')
      expect(dalExample.path).toBe('/dal-example')
    })

    test('it calls the dal connector and renders view', async () => {
      await dalExample.handler(request, h)

      expect(dalConnector).toHaveBeenCalled()
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
