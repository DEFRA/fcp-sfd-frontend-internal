import { vi, beforeEach, describe, test, expect } from 'vitest'

describe('Config', () => {
  describe('Entra', () => {
    beforeEach(() => {
      vi.resetModules()
      process.env.ENTRA_WELL_KNOWN_URL = 'mockWellKnownUrl'
      process.env.ENTRA_CLIENT_ID = 'mockClientId'
      process.env.ENTRA_CLIENT_SECRET = 'mockClientSecret'
      process.env.ENTRA_REDIRECT_URL = 'mockRedirectUrl'
      process.env.ENTRA_SIGN_OUT_REDIRECT_URL = 'mockSignOutRedirectUrl'
      process.env.ENTRA_REFRESH_TOKENS = 'false'
    })

    test('should return well known url from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.wellKnownUrl')).toBe('mockWellKnownUrl')
    })

    test('should return null if well known url environment variable is not set', async () => {
      delete process.env.ENTRA_WELL_KNOWN_URL
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.wellKnownUrl')).toBe(null)
    })

    test('should return client id from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.clientId')).toBe('mockClientId')
    })

    test('should return null if client id environment variable is not set', async () => {
      delete process.env.ENTRA_CLIENT_ID
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.clientId')).toBe(null)
    })

    test('should return client secret from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.clientSecret')).toBe('mockClientSecret')
    })

    test('should return null if client secret environment variable is not set', async () => {
      delete process.env.ENTRA_CLIENT_SECRET
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.clientSecret')).toBe(null)
    })

    test('should return redirect url from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.redirectUrl')).toBe('mockRedirectUrl')
    })

    test('should return null if redirect url environment variable is not set', async () => {
      delete process.env.ENTRA_REDIRECT_URL
      const { config } = await import('../../../src/config/index.js')
      expect(config.get('entra.redirectUrl')).toBe(null)
    })

    test('should return sign out redirect url from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.signOutRedirectUrl')).toBe('mockSignOutRedirectUrl')
    })

    test('should return null if sign out redirect url environment variable is not set', async () => {
      delete process.env.ENTRA_SIGN_OUT_REDIRECT_URL
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.signOutRedirectUrl')).toBe(null)
    })

    test('should return refresh tokens from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.refreshTokens')).toBe(false)
    })

    test('should default to refreshing tokens if environment variable is not set', async () => {
      delete process.env.ENTRA_REFRESH_TOKENS
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('entra.refreshTokens')).toBe(true)
    })
  })

  describe('Data access layer (DAL)', () => {
    beforeEach(() => {
      vi.resetModules()
      process.env.DAL_ENDPOINT = 'http://mock-fcp-dal-api:3005/graphql'
    })

    test('should return dal endpoint from environment variable if set', async () => {
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('dalConfig.endpoint')).toBe('http://mock-fcp-dal-api:3005/graphql')
    })
  })

  describe('Feature Toggle', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    test('should return false as dalConnection value when environment DAL_CONNECTION is not set', async () => {
      delete process.env.DAL_CONNECTION
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('featureToggle.dalConnection')).toBe(false)
    })

    test('should return false as dalConnection value when environment DAL_CONNECTION is false', async () => {
      process.env.DAL_CONNECTION = false
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('featureToggle.dalConnection')).toBe(false)
    })

    test('should return true as dalConnection value when environment DAL_CONNECTION is false', async () => {
      process.env.DAL_CONNECTION = true
      const { config } = await import('../../../src/config/index.js')

      expect(config.get('featureToggle.dalConnection')).toBe(true)
    })
  })
})
