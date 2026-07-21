// Test framework dependencies
import { describe, test, expect, vi } from 'vitest'

// Mocks
vi.mock('../../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: vi.fn()
}))

vi.mock('../../../../src/auth/state.js', () => ({
  validateState: vi.fn()
}))

vi.mock('../../../../src/auth/verify-token.js', () => ({
  verifyToken: vi.fn()
}))

vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'featureToggle.useDalTestEmail') return false
      return null
    })
  }
}))

// Thing under test
import { clientSecretRoutes } from '../../../../src/routes/auth/client-secret-routes.js'

const [signIn, signInOidc, signOut, signOutOidc] = clientSecretRoutes

describe('client-secret-routes', () => {
  test('should return an array of routes', () => {
    expect(clientSecretRoutes).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    test('should have the correct method and path configured', () => {
      expect(signIn.method).toBe('GET')
      expect(signIn.path).toBe('/auth/sign-in')
    })

    test('should require authentication with Entra', () => {
      expect(signIn.options.auth).toBe('entra')
    })

    test('should have a handler', () => {
      expect(signIn.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    test('should have the correct method and path configured', () => {
      expect(signInOidc.method).toBe('GET')
      expect(signInOidc.path).toBe('/auth/sign-in-oidc')
    })

    test('should attempt authentication with Entra', () => {
      expect(signInOidc.options.auth.strategy).toBe('entra')
      expect(signInOidc.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signInOidc.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out', () => {
    test('should have the correct method and path configured', () => {
      expect(signOut.method).toBe('GET')
      expect(signOut.path).toBe('/auth/sign-out')
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(signOut.options.auth.mode).toBe('try')
      expect(signOut.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(signOut.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    test('should have the correct method and path configured', () => {
      expect(signOutOidc.method).toBe('GET')
      expect(signOutOidc.path).toBe('/auth/sign-out-oidc')
    })

    test('should attempt to authenticate with default strategy', () => {
      expect(signOutOidc.options.auth.strategy).toBeUndefined()
      expect(signOutOidc.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(signOutOidc.handler).toBeInstanceOf(Function)
    })
  })
})
