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
      info: {
        referrer: 'https://internal.test/some-previous-page'
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
    const mockRequest = { info: { referrer: '' } }

    cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is unsafe', () => {
    const mockRequest = {
      info: {
        referrer: 'javascript:alert(1)'
      }
    }

    cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is relative', () => {
    const mockRequest = {
      info: {
        referrer: '/some-previous-page'
      }
    }

    cookies.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('cookies', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })
})
