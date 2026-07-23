// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Things we need to mock
import { fetchPersonalDetailsService } from '../../../../src/services/fetch-personal-details-service.js'

// Thing under test
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'

// Mocks
vi.mock('../../../../src/services/fetch-personal-details-service.js', () => ({
  fetchPersonalDetailsService: vi.fn()
}))

describe('fetchPersonalChangeService', () => {
  let yar

  beforeEach(() => {
    vi.clearAllMocks()

    yar = { get: vi.fn().mockReturnValue({}) }

    fetchPersonalDetailsService.mockResolvedValue({
      crn: '1234567890',
      info: {
        userName: 'John Doe',
        fullName: { first: 'John', middle: 'M', last: 'Doe' }
      }
    })
  })

  test('it fetches the personal details for the given crn and email', async () => {
    await fetchPersonalChangeService(yar, '1234567890', 'test@example.com', 'changePersonalName')

    expect(fetchPersonalDetailsService).toHaveBeenCalledWith('1234567890', 'test@example.com')
  })

  describe('when the session has a matching change', () => {
    beforeEach(() => {
      yar.get.mockReturnValue({ changePersonalName: { first: 'Jane', middle: 'A', last: 'Smith' } })
    })

    test('it merges the session change into the personal details', async () => {
      const result = await fetchPersonalChangeService(yar, '1234567890', 'test@example.com', 'changePersonalName')

      expect(result.changePersonalName).toEqual({ first: 'Jane', middle: 'A', last: 'Smith' })
    })
  })

  describe('when passed an array of fields', () => {
    beforeEach(() => {
      yar.get.mockReturnValue({
        changePersonalName: { first: 'Jane' },
        changePersonalEmail: 'jane@example.com'
      })
    })

    test('it merges each matching field that exists in the session', async () => {
      const result = await fetchPersonalChangeService(yar, '1234567890', 'test@example.com', ['changePersonalName', 'changePersonalEmail'])

      expect(result.changePersonalName).toEqual({ first: 'Jane' })
      expect(result.changePersonalEmail).toEqual('jane@example.com')
    })
  })

  describe('when there is no session data', () => {
    beforeEach(() => {
      yar.get.mockReturnValue(undefined)
    })

    test('it returns the personal details unchanged', async () => {
      const result = await fetchPersonalChangeService(yar, '1234567890', 'test@example.com', 'changePersonalName')

      expect(result.changePersonalName).toBeUndefined()
    })
  })
})
