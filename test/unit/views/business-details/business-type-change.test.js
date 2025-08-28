import { describe, test, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { renderTemplate } from '../../../helpers/render-template.js'

describe('change business type', () => {
  const html = renderTemplate('business/business-type-change.njk')
  const dom = new JSDOM(html)
  const document = dom.window.document

  test.each([
    ['page heading', 'h1', 'Change your business type'],
    ['contact section heading', 'h2', 'Contact the Rural Payments Agency']
  ])('should render %s', (_, selector, textContent) => {
    const heading = document.querySelector(selector)

    expect(heading).not.toBeNull()
    expect(heading.textContent.trim()).toContain(textContent)
  })

  test('should include the contact guidance text', () => {
    const bodyText = document.body.textContent

    expect(bodyText).toContain('If your business type is incorrect, contact the Rural Payments Agency to update it.')
  })

  test('should render a return button that navigates to business details', () => {
    const button = document.querySelector('a.govuk-button[href="/business-details"]')

    expect(button).not.toBeNull()
    expect(button.getAttribute('href')).toBe('/business-details')
    expect(button.textContent.trim()).toContain('Return to business details')
  })
})
