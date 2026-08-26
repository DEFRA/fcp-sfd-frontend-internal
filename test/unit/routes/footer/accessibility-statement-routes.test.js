import { vi, beforeEach, describe, test, expect } from 'vitest'
import { accessibilityStatement } from '../../../../src/routes/footer/accessibility-statement-routes.js'

describe('Accessibility statement endpoint', () => {
  let viewMock

  beforeEach(() => {
    viewMock = vi.fn().mockReturnValue('mock view return')
    vi.clearAllMocks()
  })

  test('should have the correct method and path', () => {
    expect(accessibilityStatement.method).toBe('GET')
    expect(accessibilityStatement.path).toBe('/accessibility-statement')
  })

  test('should render the accessibility-statement view with correct data', () => {
    const mockRequest = {
      info: {
        referrer: 'https://internal.test/some-previous-page'
      }
    }

    const h = { view: viewMock }

    const result = accessibilityStatement.handler(mockRequest, h)

    expect(viewMock).toHaveBeenCalledWith('footer/accessibility-statement', {
      pageTitle: 'Accessibility statement',
      heading: 'Accessibility statement',
      backLink: '/some-previous-page'
    })

    expect(result).toBe('mock view return')
  })

  test('falls back to the search page when there is no referer', () => {
    const mockRequest = { info: { referrer: '' } }
    const h = { view: viewMock }

    accessibilityStatement.handler(mockRequest, h)

    expect(viewMock).toHaveBeenCalledWith('footer/accessibility-statement', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is unsafe', () => {
    const mockRequest = {
      info: {
        referrer: 'javascript:alert(1)'
      }
    }
    const h = { view: viewMock }

    accessibilityStatement.handler(mockRequest, h)

    expect(viewMock).toHaveBeenCalledWith('footer/accessibility-statement', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })

  test('falls back to the search page when the referer is relative', () => {
    const mockRequest = {
      info: {
        referrer: '/some-previous-page'
      }
    }
    const h = { view: viewMock }

    accessibilityStatement.handler(mockRequest, h)

    expect(viewMock).toHaveBeenCalledWith('footer/accessibility-statement', expect.objectContaining({
      backLink: '/search-sbi'
    }))
  })
})
