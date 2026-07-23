import { vi, beforeEach, describe, test, expect } from 'vitest'

// Mocks
const mockConfigGet = vi.fn()
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const mockRegisterFederatedStrategy = vi.fn()
vi.mock('../../../../src/plugins/auth/strategies/federated-credentials.js', () => ({
  registerFederatedStrategy: mockRegisterFederatedStrategy
}))

const mockRegisterClientSecretStrategy = vi.fn()
vi.mock('../../../../src/plugins/auth/strategies/client-secret.js', () => ({
  registerClientSecretStrategy: mockRegisterClientSecretStrategy
}))

// Thing under test
const { auth } = await import('../../../../src/plugins/auth/index.js')

describe('auth plugin', () => {
  let mockServer

  beforeEach(() => {
    vi.clearAllMocks()
    mockServer = {}
    mockRegisterFederatedStrategy.mockResolvedValue(undefined)
    mockRegisterClientSecretStrategy.mockResolvedValue(undefined)
  })

  test('should return an object with plugin property', () => {
    expect(auth).toBeInstanceOf(Object)
    expect(auth.plugin).toBeInstanceOf(Object)
  })

  test('should have the correct plugin name', () => {
    expect(auth.plugin.name).toBe('auth')
  })

  test('should have a register function', () => {
    expect(auth.plugin.register).toBeInstanceOf(Function)
  })

  describe('register', () => {
    describe('when useFederatedCredentials feature toggle is enabled', () => {
      beforeEach(() => {
        mockConfigGet.mockReturnValue(true)
      })

      test('should call registerFederatedStrategy', async () => {
        await auth.plugin.register(mockServer)

        expect(mockRegisterFederatedStrategy).toHaveBeenCalledWith(mockServer)
        expect(mockRegisterFederatedStrategy).toHaveBeenCalledTimes(1)
      })

      test('should not call registerClientSecretStrategy', async () => {
        await auth.plugin.register(mockServer)

        expect(mockRegisterClientSecretStrategy).not.toHaveBeenCalled()
      })
    })

    describe('when useFederatedCredentials feature toggle is disabled', () => {
      beforeEach(() => {
        mockConfigGet.mockReturnValue(false)
      })

      test('should call registerClientSecretStrategy', async () => {
        await auth.plugin.register(mockServer)

        expect(mockRegisterClientSecretStrategy).toHaveBeenCalledWith(mockServer)
        expect(mockRegisterClientSecretStrategy).toHaveBeenCalledTimes(1)
      })

      test('should not call registerFederatedStrategy', async () => {
        await auth.plugin.register(mockServer)

        expect(mockRegisterFederatedStrategy).not.toHaveBeenCalled()
      })
    })

    describe('when feature toggle config is accessed', () => {
      test('should access the correct config key', async () => {
        mockConfigGet.mockReturnValue(true)
        await auth.plugin.register(mockServer)

        expect(mockConfigGet).toHaveBeenCalledWith('featureToggle.useFederatedCredentials')
      })
    })

    describe('error handling', () => {
      test('should propagate errors from registerFederatedStrategy', async () => {
        mockConfigGet.mockReturnValue(true)
        const testError = new Error('Strategy registration failed')
        mockRegisterFederatedStrategy.mockRejectedValue(testError)

        await expect(auth.plugin.register(mockServer)).rejects.toThrow(testError)
      })

      test('should propagate errors from registerClientSecretStrategy', async () => {
        mockConfigGet.mockReturnValue(false)
        const testError = new Error('Strategy registration failed')
        mockRegisterClientSecretStrategy.mockRejectedValue(testError)

        await expect(auth.plugin.register(mockServer)).rejects.toThrow(testError)
      })
    })
  })
})
