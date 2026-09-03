// Test framework dependencies
import { describe, test, expect, vi } from 'vitest'

// Thing under test
import { personalAddressSelectPresenter } from '../../../../src/presenters/personal/personal-address-select-presenter.js'

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  presenters: {
    formatDisplayAddresses: vi.fn((addresses, selected) => {
      return addresses.map((addr) => ({
        ...addr,
        selected: `${addr.uprn}${addr.displayAddress}` === `${selected?.uprn}${selected?.displayAddress}`
      }))
    })
  }
}))

describe('personalAddressSelectPresenter', () => {
  describe('when given valid data', () => {
    test('it correctly presents the data', () => {
      const data = {
        crn: '1234567890',
        changePersonalPostcode: { postcode: 'SW1A 1AA' },
        changePersonalAddresses: [
          { uprn: '123', displayAddress: '10 Downing Street, London' },
          { uprn: '456', displayAddress: '2 The Mall, London' }
        ],
        changePersonalAddress: { uprn: '123', displayAddress: '10 Downing Street, London' }
      }

      const result = personalAddressSelectPresenter(data)

      expect(result).toEqual({
        backLink: '/customer/1234567890/account-address-change',
        postcodeChangeLink: '/customer/1234567890/account-address-change',
        manualAddressLink: '/customer/1234567890/account-address-enter',
        pageTitle: 'Choose your personal address',
        metaDescription: 'Choose the address for your personal account.',
        userName: null,
        crn: '1234567890',
        postcode: 'SW1A 1AA',
        displayAddresses: expect.any(Array)
      })
    })

    test('it sets postcode to null when changePersonalPostcode is missing', () => {
      const data = {
        crn: '1234567890',
        changePersonalAddresses: [],
        changePersonalAddress: null
      }

      const result = personalAddressSelectPresenter(data)

      expect(result.postcode).toBeNull()
    })

    test('it sets postcode to null when postcode property is missing', () => {
      const data = {
        crn: '1234567890',
        changePersonalPostcode: {},
        changePersonalAddresses: [],
        changePersonalAddress: null
      }

      const result = personalAddressSelectPresenter(data)

      expect(result.postcode).toBeNull()
    })

    test('it returns empty array when changePersonalAddresses is missing', () => {
      const data = {
        crn: '1234567890',
        changePersonalPostcode: { postcode: 'SW1A 1AA' }
      }

      const result = personalAddressSelectPresenter(data)

      expect(result.displayAddresses).toEqual([])
    })
  })

  describe('the "backLink" property', () => {
    test('it constructs the correct back link href', () => {
      const data = { crn: '9876543210', changePersonalPostcode: {} }

      const result = personalAddressSelectPresenter(data)

      expect(result.backLink).toBe('/customer/9876543210/account-address-change')
    })

    test('it falls back to the search page when the crn is missing', () => {
      const data = { changePersonalPostcode: {} }

      const result = personalAddressSelectPresenter(data)

      expect(result.backLink).toBe('/search-crn')
    })
  })

  describe('the "postcodeChangeLink" property', () => {
    test('it directs back to the address change page', () => {
      const data = { crn: '1111111111', changePersonalPostcode: {} }

      const result = personalAddressSelectPresenter(data)

      expect(result.postcodeChangeLink).toBe('/customer/1111111111/account-address-change')
    })
  })

  describe('the "manualAddressLink" property', () => {
    test('it directs to the manual address entry page', () => {
      const data = { crn: '2222222222', changePersonalPostcode: {} }

      const result = personalAddressSelectPresenter(data)

      expect(result.manualAddressLink).toBe('/customer/2222222222/account-address-enter')
    })
  })
})
