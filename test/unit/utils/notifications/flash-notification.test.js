// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Thing under test
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'

describe('flashNotification', () => {
  let yar

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock yar session manager
    yar = {
      flash: vi.fn()
    }
  })

  test('returns the standard notification { title: "Updated", text: "Changes made" }', () => {
    flashNotification(yar)

    const [flashType, notification] = yar.flash.mock.calls[0]

    expect(flashType).toEqual('notification')
    expect(notification).toEqual({ title: 'Updated', text: 'Changes made', html: null })
  })

  test('returns the overridden notification { title: "Fancy new title", text: "better text" }', () => {
    flashNotification(yar, 'Fancy new title', 'better text')

    const [flashType, notification] = yar.flash.mock.calls[0]

    expect(flashType).toEqual('notification')
    expect(notification).toEqual({ title: 'Fancy new title', text: 'better text', html: null })
  })

  test('returns a notification with html content when provided', () => {
    flashNotification(yar, 'Updated', 'Changes made', '<strong>HTML content</strong>')

    const [flashType, notification] = yar.flash.mock.calls[0]

    expect(flashType).toEqual('notification')
    expect(notification).toEqual({
      title: 'Updated',
      text: 'Changes made',
      html: '<strong>HTML content</strong>'
    })
  })
})
