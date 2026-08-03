// Test framework dependencies
import { describe, test, expect, vi } from 'vitest'

// Thing under test
import { personalAddressCheckPresenter } from '../../../../src/presenters/personal/personal-address-check-presenter.js'

// Mocks
vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  presenters: {
    formatDisplayAddress: vi.fn((addr) => {
      if (!addr) return []
      return Object.values(addr).filter(Boolean)
    })
  }
}))

describe('personalAddressCheckPresenter', () => {
  describe('when given valid data with postcode lookup address', () => {
    test('it correctly presents the data', () => {
      const personalDetails = {
        crn: '1234567890',
        changePersonalAddress: {
          uprn: '123456',
          line1: '10 Downing Street',
          city: 'London',
          postalCode: 'SW1A 1AA',
          postcodeLookup: true
        },
        address: {
          line1: '10 Downing Street',
          city: 'London',
          postalCode: 'SW1A 1AA'
        }
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/account-address-select' },
        changeLink: '/customer/1234567890/account-address-select',
        pageTitle: 'Check your personal address is correct before submitting',
        metaDescription: 'Check the address for your personal account is correct.',
        address: expect.any(Array)
      })
    })

    test('it correctly presents the data with manually entered address', () => {
      const personalDetails = {
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

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/account-address-enter' },
        changeLink: '/customer/1234567890/account-address-enter',
        pageTitle: 'Check your personal address is correct before submitting',
        metaDescription: 'Check the address for your personal account is correct.',
        address: expect.any(Array)
      })
    })
  })

  describe('when there is no pending changePersonalAddress', () => {
    test('it uses the original address from DAL', () => {
      const personalDetails = {
        crn: '1234567890',
        address: {
          line1: '10 Downing Street',
          city: 'London',
          postalCode: 'SW1A 1AA'
        }
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.address).toEqual(['10 Downing Street', 'London', 'SW1A 1AA'])
    })
  })

  describe('formatAddress with postcode lookup', () => {
    test('it filters out falsy values and removes uprn, displayAddress, postcodeLookup', () => {
      const personalDetails = {
        crn: '1234567890',
        changePersonalAddress: {
          uprn: '123456',
          displayAddress: '10 Downing Street, London SW1A 1AA',
          postcodeLookup: true,
          line1: '10 Downing Street',
          line2: null,
          line3: undefined,
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'England'
        },
        address: {}
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.address).not.toContain('123456')
      expect(result.address).not.toContain('10 Downing Street, London SW1A 1AA')
      expect(result.address).not.toContain(true)
      expect(result.address).toContain('10 Downing Street')
      expect(result.address).toContain('London')
    })
  })

  describe('formatAddress with manual address', () => {
    test('it filters out all falsy values', () => {
      const personalDetails = {
        crn: '1234567890',
        changePersonalAddress: {
          line1: '10 Downing Street',
          line2: null,
          line3: undefined,
          line4: '',
          city: 'London',
          postalCode: 'SW1A 1AA'
        },
        address: {}
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.address).toEqual(['10 Downing Street', 'London', 'SW1A 1AA'])
    })
  })

  describe('the "backLink" property', () => {
    test('it uses addressBackLink helper from engine for postcode lookup', () => {
      const personalDetails = {
        crn: '1111111111',
        changePersonalAddress: {
          postcodeLookup: true,
          line1: '10 Downing Street'
        }
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.backLink.href).toBe('/customer/1111111111/account-address-select')
    })

    test('it uses addressBackLink helper from engine for manual address', () => {
      const personalDetails = {
        crn: '2222222222',
        changePersonalAddress: {
          line1: '10 Downing Street'
        }
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.backLink.href).toBe('/customer/2222222222/account-address-enter')
    })
  })

  describe('the "changeLink" property', () => {
    test('it directs to the appropriate change page based on address type', () => {
      const personalDetails = {
        crn: '3333333333',
        changePersonalAddress: {
          postcodeLookup: true,
          line1: '10 Downing Street'
        }
      }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.changeLink).toBe('/customer/3333333333/account-address-select')
    })
  })

  describe('page title and meta description', () => {
    test('it has correct page title', () => {
      const personalDetails = { crn: '1234567890' }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.pageTitle).toBe('Check your personal address is correct before submitting')
    })

    test('it has correct meta description', () => {
      const personalDetails = { crn: '1234567890' }

      const result = personalAddressCheckPresenter(personalDetails)

      expect(result.metaDescription).toBe('Check the address for your personal account is correct.')
    })
  })
})
