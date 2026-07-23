// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock dependencies
const mockFetchBusinessDetailsService = vi.fn()

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: mockFetchBusinessDetailsService
}))

// Thing under test
const { fetchBusinessFixService } = await import('../../../../src/services/business/fetch-business-fix-service.js')

describe('fetchBusinessFixService', () => {
  let credentials
  let businessDetails

  beforeEach(() => {
    vi.clearAllMocks()

    credentials = { email: 'test.user@defra.gov.uk' }
    businessDetails = { info: { sbi: '107183280' }, contact: { email: 'old@example.com' } }

    mockFetchBusinessDetailsService.mockResolvedValue(businessDetails)
  })

  test('fetches the live business details and overlays the session context', async () => {
    const sessionData = { orderedSectionsToFix: ['email'], source: 'business-details' }

    const result = await fetchBusinessFixService(credentials, sessionData)

    expect(mockFetchBusinessDetailsService).toHaveBeenCalledWith(credentials)
    expect(result.source).toBe('business-details')
    expect(result.orderedSectionsToFix).toEqual(['email'])
    expect(result.info).toEqual(businessDetails.info)
  })

  test('returns the details unchanged when there are no in-progress fixes', async () => {
    const sessionData = { orderedSectionsToFix: ['email'], source: 'business-details' }

    const result = await fetchBusinessFixService(credentials, sessionData)

    expect(result.changeBusinessEmail).toBeUndefined()
  })

  test('merges an in-progress email fix into the live details', async () => {
    const sessionData = {
      orderedSectionsToFix: ['email'],
      source: 'business-details',
      businessFixUpdates: { email: { businessEmail: 'new@example.com' } }
    }

    const result = await fetchBusinessFixService(credentials, sessionData)

    expect(result.changeBusinessEmail).toEqual({ businessEmail: 'new@example.com' })
  })

  test('does not merge an email change when the fix updates have no email', async () => {
    const sessionData = {
      orderedSectionsToFix: ['email'],
      source: 'business-details',
      businessFixUpdates: {}
    }

    const result = await fetchBusinessFixService(credentials, sessionData)

    expect(result.changeBusinessEmail).toBeUndefined()
  })

  test('defaults to empty session data when none is provided', async () => {
    const result = await fetchBusinessFixService(credentials)

    expect(mockFetchBusinessDetailsService).toHaveBeenCalledWith(credentials)
    expect(result.orderedSectionsToFix).toBeUndefined()
    expect(result.changeBusinessEmail).toBeUndefined()
  })
})
