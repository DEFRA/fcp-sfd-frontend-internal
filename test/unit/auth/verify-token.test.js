import { vi, beforeEach, describe, test, expect } from 'vitest'

const mockKid = 'test-kid'
const mockToken = 'mock.jwt.token'
const mockJwksUri = 'https://example.com/jwks'
const mockPem = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----'

const mockDecode = vi.fn()
const mockVerify = vi.fn()
vi.mock('@hapi/jwt', () => ({
  default: {
    token: {
      decode: mockDecode,
      verify: mockVerify
    }
  }
}))

const mockWreckGet = vi.fn()
vi.mock('@hapi/wreck', () => ({
  default: {
    get: mockWreckGet
  }
}))

const mockGetOidcConfig = vi.fn()
vi.mock('../../../src/auth/get-oidc-config.js', () => ({
  getOidcConfig: mockGetOidcConfig
}))

const mockExport = vi.fn()
const mockCreatePublicKey = vi.fn()
vi.mock('node:crypto', () => ({
  createPublicKey: mockCreatePublicKey
}))

const { verifyToken } = await import('../../../src/auth/verify-token.js')

const mockJwk = { kid: mockKid, kty: 'RSA', n: 'mock-n', e: 'AQAB' }
const mockDecoded = { decoded: { header: { kid: mockKid } } }

describe('verifyToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDecode.mockReturnValue(mockDecoded)
    mockGetOidcConfig.mockResolvedValue({ jwks_uri: mockJwksUri })
    mockWreckGet.mockResolvedValue({ payload: { keys: [mockJwk] } })
    mockExport.mockReturnValue(mockPem)
    mockCreatePublicKey.mockReturnValue({ export: mockExport })
  })

  test('should decode the token', async () => {
    await verifyToken(mockToken)
    expect(mockDecode).toHaveBeenCalledWith(mockToken)
  })

  test('should get oidc config to retrieve jwks_uri', async () => {
    await verifyToken(mockToken)
    expect(mockGetOidcConfig).toHaveBeenCalled()
  })

  test('should fetch jwks from the jwks_uri', async () => {
    await verifyToken(mockToken)
    expect(mockWreckGet).toHaveBeenCalledWith(mockJwksUri, { json: true })
  })

  test('should find the matching jwk by kid', async () => {
    const otherJwk = { kid: 'other-kid', kty: 'RSA' }
    mockWreckGet.mockResolvedValue({ payload: { keys: [otherJwk, mockJwk] } })
    await verifyToken(mockToken)
    expect(mockCreatePublicKey).toHaveBeenCalledWith({ key: mockJwk, format: 'jwk' })
  })

  test('should match jwk by x5t when kid does not match', async () => {
    const x5tJwk = { x5t: mockKid, kty: 'RSA' }
    mockWreckGet.mockResolvedValue({ payload: { keys: [x5tJwk] } })
    await verifyToken(mockToken)
    expect(mockCreatePublicKey).toHaveBeenCalledWith({ key: x5tJwk, format: 'jwk' })
  })

  test('should throw an error when no matching jwk is found', async () => {
    mockWreckGet.mockResolvedValue({ payload: { keys: [{ kid: 'different-kid' }] } })
    await expect(verifyToken(mockToken)).rejects.toThrow(`No matching JWK for kid ${mockKid}`)
  })

  test('should create public key from matching jwk in jwk format', async () => {
    await verifyToken(mockToken)
    expect(mockCreatePublicKey).toHaveBeenCalledWith({ key: mockJwk, format: 'jwk' })
  })

  test('should export the public key as spki pem', async () => {
    await verifyToken(mockToken)
    expect(mockExport).toHaveBeenCalledWith({ type: 'spki', format: 'pem' })
  })

  test('should verify the token with the pem key and RS256 algorithm', async () => {
    await verifyToken(mockToken)
    expect(mockVerify).toHaveBeenCalledWith(mockDecoded, { key: mockPem, algorithm: 'RS256' })
  })

  test('should throw if getOidcConfig fails', async () => {
    mockGetOidcConfig.mockRejectedValue(new Error('OIDC config unavailable'))
    await expect(verifyToken(mockToken)).rejects.toThrow('OIDC config unavailable')
  })

  test('should throw if jwks request fails', async () => {
    mockWreckGet.mockRejectedValue(new Error('JWKS fetch failed'))
    await expect(verifyToken(mockToken)).rejects.toThrow('JWKS fetch failed')
  })

  test('should throw if token verification fails', async () => {
    mockVerify.mockImplementation(() => { throw new Error('Invalid token') })
    await expect(verifyToken(mockToken)).rejects.toThrow('Invalid token')
  })
})
