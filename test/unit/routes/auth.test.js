import { vi, describe, beforeEach, test, expect } from 'vitest'

vi.mock('../../../src/auth/get-permissions.js', () => ({
  getPermissions: vi.fn()
}))

vi.mock('../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: vi.fn()
}))

vi.mock('../../../src/auth/validate-state.js', () => ({
  validateState: vi.fn()
}))

vi.mock('../../../src/auth/verify-token.js', () => ({
  verifyToken: vi.fn()
}))

vi.mock('../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: vi.fn()
}))

const { auth } = await import('../../../src/routes/auth-routes.js')

let route

describe('auth', () => {
  beforeEach(() => {
    route = null
  })

  test('should return an array of routes', () => {
    expect(auth).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-in')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with Entra', () => {
      expect(route.options.auth).toBe('entra')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-in-oidc')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should attempt authentication with Entra', () => {
      expect(route.options.auth.strategy).toBe('entra')
      expect(route.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-out')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(route.options.auth.mode).toBe('try')
      expect(route.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-out-oidc')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should attempt to authenticate with default strategy', () => {
      expect(route.options.auth.strategy).toBeUndefined()
      expect(route.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/organisation', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/organisation')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with Entra', () => {
      expect(route.options.auth).toBe('entra')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })
})

function getRoute (method, path) {
  return auth.find(r => r.method === method && r.path === path)
}
