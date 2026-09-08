// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock dependencies
const mockFetchBusinessDetailsService = vi.fn()

vi.mock('../../../../src/services/business/fetch-business-details-service.js', () => ({
  fetchBusinessDetailsService: mockFetchBusinessDetailsService
}))

// Thing under test
const { fetchBusinessChangeService } = await import('../../../../src/services/business/fetch-business-change-service.js')

describe('fetchBusinessChangeService', () => {
  let yar
  let sbi
  let email
  let businessDetails

  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '106705779'
    email = 'test.user@defra.gov.uk'
    businessDetails = { info: { sbi: '106705779' }, contact: { email: 'old@example.com' } }

    yar = {
      get: vi.fn().mockReturnValue({})
    }

    mockFetchBusinessDetailsService.mockResolvedValue(businessDetails)
  })

  test('fetches business details using the given sbi and email', async () => {
    await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessEmail')

    expect(yar.get).toHaveBeenCalledWith('businessDetailsUpdate')
    expect(mockFetchBusinessDetailsService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
  })

  test('merges a single in-progress change field from session into the details', async () => {
    yar.get.mockReturnValue({ changeBusinessEmail: 'new@example.com' })

    const result = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessEmail')

    expect(result.changeBusinessEmail).toBe('new@example.com')
  })

  test('merges multiple in-progress change fields when given an array', async () => {
    yar.get.mockReturnValue({
      changeBusinessEmail: 'new@example.com',
      changeBusinessName: 'New Name'
    })

    const result = await fetchBusinessChangeService(yar, sbi, email, ['changeBusinessEmail', 'changeBusinessName'])

    expect(result.changeBusinessEmail).toBe('new@example.com')
    expect(result.changeBusinessName).toBe('New Name')
  })

  test('does not add a field when it is not present in session', async () => {
    const result = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessEmail')

    expect(result.changeBusinessEmail).toBeUndefined()
  })

  test('defaults to an empty session object when nothing is stored', async () => {
    yar.get.mockReturnValue(undefined)

    await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessEmail')

    expect(mockFetchBusinessDetailsService).toHaveBeenCalledWith('106705779', 'test.user@defra.gov.uk')
  })

  test('passes an undefined sbi straight through to the details lookup', async () => {
    await fetchBusinessChangeService(yar, undefined, email, 'changeBusinessEmail')

    expect(mockFetchBusinessDetailsService).toHaveBeenCalledWith(undefined, 'test.user@defra.gov.uk')
  })
})
