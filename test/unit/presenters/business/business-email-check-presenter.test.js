// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailCheckPresenter } from '../../../../src/presenters/business/business-email-check-presenter.js'

describe('businessEmailCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      contact: { email: 'test@example.com' }
    }
  })

  test('returns the page metadata and links', () => {
    const result = businessEmailCheckPresenter(data)

    expect(result.pageTitle).toBe('Check your business email address is correct before submitting')
    expect(result.metaDescription).toBe('Check the email address for your business is correct.')
    expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/business-email-change' })
    expect(result.changeLink).toBe('/business/106705779/business-email-change')
  })

  test('builds the back link from the referrer when it is a valid url', () => {
    const result = businessEmailCheckPresenter(data, 'https://example.com/business/106705779/business-email-change')

    expect(result.backLink).toEqual({ backLink: true, href: '/business/106705779/business-email-change' })
  })

  test('uses the in-progress change email when present', () => {
    data.changeBusinessEmail = 'changed@example.com'

    const result = businessEmailCheckPresenter(data)

    expect(result.businessEmail).toBe('changed@example.com')
  })

  test('falls back to the current business email', () => {
    const result = businessEmailCheckPresenter(data)

    expect(result.businessEmail).toBe('test@example.com')
  })

  test('returns the userName when a customer is present', () => {
    data.customer = { userName: 'Jane Doe' }

    const result = businessEmailCheckPresenter(data)

    expect(result.userName).toBe('Jane Doe')
  })

  test('defaults userName to null when there is no customer', () => {
    const result = businessEmailCheckPresenter(data)

    expect(result.userName).toBeNull()
  })

  test('exposes the business name and sbi', () => {
    const result = businessEmailCheckPresenter(data)

    expect(result.businessName).toBe('Herberts Lawn Mowing')
    expect(result.sbi).toBe('106705779')
  })
})
