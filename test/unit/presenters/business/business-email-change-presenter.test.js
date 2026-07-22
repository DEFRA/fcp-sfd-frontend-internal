// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailChangePresenter } from '../../../../src/presenters/business/business-email-change-presenter.js'

describe('businessEmailChangePresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      contact: { email: 'test@example.com' }
    }
  })

  test('returns the page metadata', () => {
    const result = businessEmailChangePresenter(data)

    expect(result.pageTitle).toBe('What is your business email address?')
    expect(result.metaDescription).toBe('Update the email address for your business.')
  })

  test('builds the back link from the sbi', () => {
    const result = businessEmailChangePresenter(data)

    expect(result.backLink).toEqual({ href: '/business/106705779/details' })
  })

  test('uses the current business email when no change or payload exists', () => {
    const result = businessEmailChangePresenter(data)

    expect(result.businessEmail).toBe('test@example.com')
  })

  test('prefers the in-progress change over the current email', () => {
    data.changeBusinessEmail = 'changed@example.com'

    const result = businessEmailChangePresenter(data)

    expect(result.businessEmail).toBe('changed@example.com')
  })

  test('prefers the submitted payload over everything else', () => {
    data.changeBusinessEmail = 'changed@example.com'

    const result = businessEmailChangePresenter(data, 'payload@example.com')

    expect(result.businessEmail).toBe('payload@example.com')
  })

  test('returns the userName when a customer is present', () => {
    data.customer = { userName: 'Jane Doe' }

    const result = businessEmailChangePresenter(data)

    expect(result.userName).toBe('Jane Doe')
  })

  test('defaults userName to null when there is no customer', () => {
    const result = businessEmailChangePresenter(data)

    expect(result.userName).toBeNull()
  })

  test('exposes the business name and sbi', () => {
    const result = businessEmailChangePresenter(data)

    expect(result.businessName).toBe('Herberts Lawn Mowing')
    expect(result.sbi).toBe('106705779')
  })
})
