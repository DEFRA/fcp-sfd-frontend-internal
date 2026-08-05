import { vi, beforeEach, describe, test, expect } from 'vitest'

const mockConfigGet = vi.fn()
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const mockRegisterClientSecretStrategy = vi.fn()
vi.mock('../../../../src/plugins/auth/strategies/client-secret.js', () => ({
  registerClientSecretStrategy: mockRegisterClientSecretStrategy
}))

const { auth } = await import('../../../../src/plugins/auth/index.js')

describe('auth plugin', () => {
  const mockServer = {}

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'featureToggle.useFederatedCredentials':
          return false
        default:
          return null
      }
    })
  })

  test('should export a plugin object', () => {
    expect(auth).toBeInstanceOf(Object)
  })

  test('should have name "auth"', () => {
    expect(auth.plugin.name).toBe('auth')
  })

  test('should have a register function', () => {
    expect(auth.plugin.register).toBeInstanceOf(Function)
  })

  describe('register', () => {
    test('should register client-secret strategy when federated is disabled', async () => {
      await auth.plugin.register(mockServer)
      expect(mockRegisterClientSecretStrategy).toHaveBeenCalledWith(mockServer)
    })

    test('should log warning and register client-secret strategy when federated is enabled', async () => {
      const mockLogger = { warn: vi.fn() }
      const serverWithLogger = { ...mockServer, logger: mockLogger }

      mockConfigGet.mockImplementation((key) => {
        if (key === 'featureToggle.useFederatedCredentials') {
          return true
        }
        return null
      })

      await auth.plugin.register(serverWithLogger)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Federated credentials requested but not yet implemented. Using client-secret strategy.'
      )
      expect(mockRegisterClientSecretStrategy).toHaveBeenCalledWith(serverWithLogger)
    })
  })
})
