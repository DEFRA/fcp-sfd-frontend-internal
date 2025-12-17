// Test framework dependencies
import { vi, beforeEach, describe, test, expect } from 'vitest'

// Things we need to mock
import { dalConnector } from '../../../src/dal/connector.js'

// Thing under test
import { homeRoutes } from '../../../src/routes/home-routes.js'
const [index, home] = homeRoutes

// Mocks
vi.mock('../../../src/dal/connector.js', () => ({
  dalConnector: vi.fn()
}))

describe('Root endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return an object', () => {
    expect(index).toBeInstanceOf(Object)
  })

  test('should return GET / route', () => {
    expect(index.method).toBe('GET')
    expect(index.path).toBe('/')
  })

  test('should try and authenticate using default strategy', () => {
    expect(index.options.auth.strategy).toBeUndefined()
    expect(index.options.auth.mode).toBe('try')
  })

  test('should have a handler', () => {
    expect(index.handler).toBeInstanceOf(Function)
  })
})

describe('Home endpoint', () => {
  let h
  let request

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /home', () => {
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
      expect(home.method).toBe('GET')
      expect(home.path).toBe('/home')
    })

    test('it calls the dal connector and renders view', async () => {
      await home.handler(request, h)

      expect(dalConnector).toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('home', { dalData: getMockDalResponse().data })
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
