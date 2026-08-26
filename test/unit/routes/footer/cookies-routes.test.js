import { vi, beforeEach, describe, test, expect } from 'vitest'
import { cookies } from '../../../../src/routes/footer/cookies-routes.js'

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
    const mockRequest = {
      headers: {
        referer: '/some-previous-page'
      }
    }

    const result = cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', {
      pageTitle: 'Cookies',
      heading: 'How we use cookies to store information about how you use this service.',
      backLink: '/some-previous-page'
    })

    expect(result).toBe(mockView)
  })

  test('falls back to the search page when there is no referer', () => {
    const mockRequest = { headers: {} }

    cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is unsafe', () => {
    const mockRequest = {
      headers: {
        referer: 'javascript:alert(1)'
      }
    }

    cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })
})
