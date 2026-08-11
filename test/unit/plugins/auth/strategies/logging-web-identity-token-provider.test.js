import { vi, beforeEach, describe, test, expect } from 'vitest'

const mockGetCredentials = vi.fn()

class MockWebIdentityTokenProvider {
  async getCredentials (logger) {
    return mockGetCredentials(logger)
  }
}

vi.mock('@defra/hapi-auth-oidc', () => ({
  WebIdentityTokenProvider: MockWebIdentityTokenProvider
}))

const { LoggingWebIdentityTokenProvider } = await import(
  '../../../../../src/plugins/auth/strategies/logging-web-identity-token-provider.js'
)

const buildToken = (claims) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'RS256' })}.${encode(claims)}.signature`
}

const CLAIMS_MESSAGE =
  '[Web Identity] assertion claims, to match against the Entra federated credential'

const claims = {
  iss: 'https://a19dfab3-318a-47fa-8133-57c7670003c7.tokens.sts.global.api.aws',
  sub: 'arn:aws:iam::332499610595:role/fcp-sfd-frontend-internal',
  aud: 'mockAudience',
  exp: 1234567890
}

describe('LoggingWebIdentityTokenProvider', () => {
  let provider
  let logger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = { info: vi.fn(), error: vi.fn() }
    provider = new LoggingWebIdentityTokenProvider({ audience: ['mockAudience'] })
  })

  describe('when an assertion is issued', () => {
    beforeEach(() => {
      mockGetCredentials.mockResolvedValue(buildToken(claims))
    })

    test('should return the assertion unchanged', async () => {
      expect(await provider.getCredentials(logger)).toBe(buildToken(claims))
    })

    test('should pass the logger through to the underlying provider', async () => {
      await provider.getCredentials(logger)

      expect(mockGetCredentials).toHaveBeenCalledWith(logger)
    })

    test('should log only the issuer, subject and audience', async () => {
      await provider.getCredentials(logger)

      expect(logger.info).toHaveBeenCalledWith(
        { iss: claims.iss, sub: claims.sub, aud: claims.aud },
        CLAIMS_MESSAGE
      )
    })

    test('should not log the assertion itself', async () => {
      await provider.getCredentials(logger)

      expect(JSON.stringify(logger.info.mock.calls)).not.toContain('signature')
    })

    test('should log once while the assertion is unchanged', async () => {
      await provider.getCredentials(logger)
      await provider.getCredentials(logger)

      expect(logger.info).toHaveBeenCalledTimes(1)
    })

    test('should log again when a new assertion is issued', async () => {
      await provider.getCredentials(logger)

      mockGetCredentials.mockResolvedValue(buildToken({ ...claims, exp: 1234567891 }))
      await provider.getCredentials(logger)

      expect(logger.info).toHaveBeenCalledTimes(2)
    })

    test('should not throw when no logger is supplied', async () => {
      await expect(provider.getCredentials()).resolves.toBe(buildToken(claims))
    })
  })

  describe('when no assertion is issued', () => {
    beforeEach(() => {
      mockGetCredentials.mockResolvedValue(null)
    })

    test('should return the empty result', async () => {
      expect(await provider.getCredentials(logger)).toBeNull()
    })

    test('should report that there are no claims', async () => {
      await provider.getCredentials(logger)

      expect(logger.error).toHaveBeenCalledWith(
        '[Web Identity] no assertion was issued, so no claims to report'
      )
    })

    test('should not throw when no logger is supplied', async () => {
      await expect(provider.getCredentials()).resolves.toBeNull()
    })
  })

  describe('when the assertion is malformed', () => {
    test('should log undefined claims rather than throwing', async () => {
      mockGetCredentials.mockResolvedValue('not-a-jwt')

      await expect(provider.getCredentials(logger)).resolves.toBe('not-a-jwt')
      expect(logger.info).toHaveBeenCalledWith(
        { iss: undefined, sub: undefined, aud: undefined },
        CLAIMS_MESSAGE
      )
    })

    test('should report a decoding failure when the payload is not JSON', async () => {
      mockGetCredentials.mockResolvedValue('header.bm90LWpzb24.signature')

      await provider.getCredentials(logger)

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: expect.any(Error) }),
        '[Web Identity] could not decode the assertion claims'
      )
    })
  })
})
