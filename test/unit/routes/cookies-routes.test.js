import { vi, beforeEach, describe, test, expect } from 'vitest'
import { cookies } from '../../../src/routes/cookies-routes.js'

const mockView = vi.fn()

const mockH = {
  view: vi.fn().mockReturnValue(mockView)
}

describe('Cookies endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should have the correct method and path', () => {
    expect(cookies.method).toBe('GET')
    expect(cookies.path).toBe('/cookies')
  })

  test('should render the cookies view with correct data', () => {
    const result = cookies.handler(null, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', {
      pageTitle: 'Cookies',
      heading: 'How we use cookies to store information about how you use this service.'
    })

    expect(result).toBe(mockView)
  })
})
