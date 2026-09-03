import { vi, beforeEach, describe, test, expect } from 'vitest'
import { contactUs } from '../../../../src/routes/footer/contact-us-routes.js'

const mockView = vi.fn()

const mockH = {
  view: vi.fn().mockReturnValue(mockView)
}

describe('Contact us endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should have the correct method and path', () => {
    expect(contactUs.method).toBe('GET')
    expect(contactUs.path).toBe('/contact-help')
  })

  test('should not require authentication', () => {
    expect(contactUs.options.auth).toBe(false)
  })

  test('should render the contact-us view with correct data', () => {
    const mockRequest = {
      info: {
        referrer: 'https://internal.test/some-previous-page'
      }
    }

    const result = contactUs.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('footer/contact-help', {
      pageTitle: 'Contact us for help',
      heading: 'How to contact this service if you need help.',
      backLink: '/some-previous-page'
    })

    expect(result).toBe(mockView)
  })

  test('falls back to the search page when there is no referer', () => {
    const mockRequest = { info: { referrer: '' } }

    contactUs.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('footer/contact-help', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is unsafe', () => {
    const mockRequest = {
      info: {
        referrer: '//evil.com/phish'
      }
    }

    contactUs.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('footer/contact-help', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is relative', () => {
    const mockRequest = {
      info: {
        referrer: '/some-previous-page'
      }
    }

    contactUs.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('footer/contact-help', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })
})
