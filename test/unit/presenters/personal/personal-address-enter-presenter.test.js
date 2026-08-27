// Test framework dependencies
import { describe, test, expect, vi } from 'vitest'

// Thing under test
import { personalAddressEnterPresenter } from '../../../../src/presenters/personal/personal-address-enter-presenter.js'

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  presenters: {
    formatChangedAddress: vi.fn((addr) => addr),
    formatOriginalAddress: vi.fn((addr) => addr)
  }
}))

describe('personalAddressEnterPresenter', () => {
  describe('when given valid data', () => {
    test('it correctly presents the data', () => {
      const data = {
        crn: '1234567890',
        changePersonalAddress: {
          line1: '10 Downing Street',
          city: 'London',
          postalCode: 'SW1A 1AA'
        },
        address: {
          line1: '10 Downing Street',
          city: 'London',
          postalCode: 'SW1A 1AA'
        }
      }

      const result = personalAddressEnterPresenter(data)

      expect(result).toEqual({
        backLink: '/customer/1234567890/account-address-change',
        pageTitle: 'Enter your personal address',
        metaDescription: 'Enter the address for your personal account.',
        userName: null,
        crn: '1234567890',
        address: expect.any(Object)
      })
    })

    test('it returns null address when no data available', () => {
      const data = {
        crn: '1234567890'
      }

      const result = personalAddressEnterPresenter(data)

      expect(result.address).toBeNull()
    })
  })

  describe('formatAddress priority order', () => {
    test('prioritises payload over changePersonalAddress and originalAddress', () => {
      const payload = { line1: 'Payload Address' }
      const changePersonalAddress = { line1: 'Changed Address' }
      const originalAddress = { line1: 'Original Address' }
      const data = {
        crn: '1111111111',
        changePersonalAddress,
        address: originalAddress
      }

      const result = personalAddressEnterPresenter(data, payload)

      expect(result.address).toBe(payload)
    })

    test('uses changePersonalAddress when payload is not provided', () => {
      const changePersonalAddress = { line1: 'Changed Address' }
      const originalAddress = { line1: 'Original Address' }
      const data = {
        crn: '2222222222',
        changePersonalAddress,
        address: originalAddress
      }

      const result = personalAddressEnterPresenter(data, undefined)

      expect(result.address).toBe(changePersonalAddress)
    })

    test('uses originalAddress when payload and changePersonalAddress are not provided', () => {
      const originalAddress = { line1: 'Original Address' }
      const data = {
        crn: '3333333333',
        address: originalAddress
      }

      const result = personalAddressEnterPresenter(data)

      expect(result.address).toBe(originalAddress)
    })
  })

  describe('the "backLink" property', () => {
    test('it constructs the correct back link href', () => {
      const data = { crn: '9876543210' }

      const result = personalAddressEnterPresenter(data)

      expect(result.backLink).toBe('/customer/9876543210/account-address-change')
    })

    test('it falls back to the search page when the crn is missing', () => {
      const data = {}

      const result = personalAddressEnterPresenter(data)

      expect(result.backLink).toBe('/search-crn')
    })
  })

  describe('page title and meta description', () => {
    test('it has correct page title', () => {
      const data = { crn: '1234567890' }

      const result = personalAddressEnterPresenter(data)

      expect(result.pageTitle).toBe('Enter your personal address')
    })

    test('it has correct meta description', () => {
      const data = { crn: '1234567890' }

      const result = personalAddressEnterPresenter(data)

      expect(result.metaDescription).toBe('Enter the address for your personal account.')
    })
  })
})
