// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { personalAddressChangePresenter } from '../../../../src/presenters/personal/personal-address-change-presenter.js'

describe('personalAddressChangePresenter', () => {
  describe('when given valid data', () => {
    test('it correctly presents the data', () => {
      const data = {
        crn: '1234567890',
        changePersonalPostcode: { postcode: 'SW1A 1AA' },
        address: { postcode: 'SW1A 2AA' }
      }

      const result = personalAddressChangePresenter(data)

      expect(result).toEqual({
        backLink: '/customer/1234567890/details',
        manualAddressLink: '/customer/1234567890/account-address-enter',
        pageTitle: 'What is your personal address?',
        metaDescription: 'Update the address for your personal account.',
        postcode: 'SW1A 1AA'
      })
    })
  })

  describe('postcode selection priority order', () => {
    test('prioritises payload over changePersonalPostcode and address postcode', () => {
      const payload = 'SW1A 1AA'
      const data = {
        crn: '1111111111',
        changePersonalPostcode: { postcode: 'SW1A 2AA' },
        address: { postcode: 'SW1A 3AA' }
      }

      const result = personalAddressChangePresenter(data, payload)

      expect(result.postcode).toBe('SW1A 1AA')
    })

    test('uses changePersonalPostcode when payload is not provided', () => {
      const data = {
        crn: '2222222222',
        changePersonalPostcode: { postcode: 'SW1A 2AA' },
        address: { postcode: 'SW1A 3AA' }
      }

      const result = personalAddressChangePresenter(data)

      expect(result.postcode).toBe('SW1A 2AA')
    })

    test('uses address postcode when changePersonalPostcode is not available', () => {
      const data = {
        crn: '3333333333',
        address: { postcode: 'SW1A 3AA' }
      }

      const result = personalAddressChangePresenter(data)

      expect(result.postcode).toBe('SW1A 3AA')
    })

    test('returns undefined when no postcode data available', () => {
      const data = {
        crn: '4444444444',
        address: {}
      }

      const result = personalAddressChangePresenter(data)

      expect(result.postcode).toBeUndefined()
    })
  })

  describe('the "backLink" property', () => {
    test('it directs to the customer details page', () => {
      const data = { crn: '9876543210', address: { postcode: 'SW1A 1AA' } }

      const result = personalAddressChangePresenter(data)

      expect(result.backLink).toBe('/customer/9876543210/details')
    })

    test('it falls back to the search page when the crn is missing', () => {
      const data = { address: { postcode: 'SW1A 1AA' } }

      const result = personalAddressChangePresenter(data)

      expect(result.backLink).toBe('/search-crn')
    })
  })

  describe('the "manualAddressLink" property', () => {
    test('it directs to the manual address entry page', () => {
      const data = { crn: '5555555555', address: { postcode: 'SW1A 1AA' } }

      const result = personalAddressChangePresenter(data)

      expect(result.manualAddressLink).toBe('/customer/5555555555/account-address-enter')
    })
  })

  describe('page title and meta description', () => {
    test('it has correct page title', () => {
      const data = { crn: '1234567890', address: { postcode: 'SW1A 1AA' } }

      const result = personalAddressChangePresenter(data)

      expect(result.pageTitle).toBe('What is your personal address?')
    })

    test('it has correct meta description', () => {
      const data = { crn: '1234567890', address: { postcode: 'SW1A 1AA' } }

      const result = personalAddressChangePresenter(data)

      expect(result.metaDescription).toBe('Update the address for your personal account.')
    })
  })
})
