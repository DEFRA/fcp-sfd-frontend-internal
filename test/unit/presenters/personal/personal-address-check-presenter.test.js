// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalAddressCheckPresenter } from '../../../../src/presenters/personal/personal-address-check-presenter.js'

describe('personalAddressCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      crn: '1234567890',
      address: {
        lookup: {
          pafOrganisationName: null,
          buildingNumberRange: null,
          flatName: null,
          buildingName: null,
          dependentLocality: null,
          doubleDependentLocality: null,
          street: null,
          county: null,
          uprn: null
        },
        manual: {
          line1: '10 Skirbeck Way',
          line2: 'Lonely Lane',
          line3: null,
          line4: 'Somerset',
          line5: null
        },
        city: 'Maidstone',
        postcode: 'SK22 1DL',
        country: 'United Kingdom'
      }
    }
  })

  describe('when provided with personal address check data', () => {
    test('it correctly presents the data', () => {
      const result = personalAddressCheckPresenter(data)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/account-address-enter' },
        changeLink: '/customer/1234567890/account-address-enter',
        pageTitle: 'Check your personal address is correct before submitting',
        metaDescription: 'Check the address for your personal account is correct.',
        address: [
          '10 Skirbeck Way',
          'Lonely Lane',
          'Maidstone',
          'Somerset',
          'SK22 1DL',
          'United Kingdom'
        ]
      })
    })
  })

  describe('the "address" property', () => {
    describe('when provided with a changePersonalAddress thats entered manually', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: false,
          line1: 'A different address',
          city: 'Maidstone',
          county: 'A new county',
          postcode: 'BA123 ABC',
          country: 'United Kingdom'
        }
      })

      test('it should return the changed address as the address', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.address).toEqual([
          'A different address',
          'Maidstone',
          'A new county',
          'BA123 ABC',
          'United Kingdom'
        ])
      })
    })

    describe('when provided with a changePersonalAddress thats entered from the postcode lookup', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: true,
          uprn: '100000111111',
          displayAddress: 'Flat 3, Fake Court, 18, Maple Road, Westfield, Bristol, BS1 4AB',
          line1: 'A newer address',
          city: 'Maidstone nowhere',
          county: 'A new county',
          postcode: 'BA12 CBA',
          country: 'United Kingdom'
        }
      })

      test('it should return the changed address as the address', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.address).toEqual([
          'A newer address',
          'Maidstone nowhere',
          'A new county',
          'BA12 CBA',
          'United Kingdom'
        ])
      })
    })

    describe('when there is no pending change in the session', () => {
      describe('and the mapped personal address was selected from the postcode lookup', () => {
        beforeEach(() => {
          data.address = {
            lookup: {
              pafOrganisationName: null,
              buildingNumberRange: '18',
              flatName: 'Flat 3',
              buildingName: 'Fake Court',
              dependentLocality: null,
              doubleDependentLocality: null,
              street: 'Maple Road',
              county: 'Bristol',
              uprn: '100000111111'
            },
            manual: {
              line1: null,
              line2: null,
              line3: null,
              line4: null,
              line5: null
            },
            city: 'Westfield',
            postcode: 'BS1 4AB',
            country: 'United Kingdom'
          }
        })

        test('it formats the nested DAL address as a flat array of strings', () => {
          const result = personalAddressCheckPresenter(data)

          expect(result.address).toEqual([
            'Flat 3',
            'Fake Court',
            '18 Maple Road',
            'Westfield',
            'Bristol',
            'BS1 4AB',
            'United Kingdom'
          ])
        })

        test('it does not render any address line as "[object Object]"', () => {
          const result = personalAddressCheckPresenter(data)

          expect(result.address.every((line) => typeof line === 'string')).toBe(true)
        })
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when postcode lookup is true', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: true
        }
      })

      test('it should return backLink with account-address-select', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.backLink).toEqual({ href: '/customer/1234567890/account-address-select' })
      })
    })

    describe('when postcode lookup is false', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: false
        }
      })

      test('it should return backLink with account-address-enter', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.backLink).toEqual({ href: '/customer/1234567890/account-address-enter' })
      })
    })
  })

  describe('the "changeLink" property', () => {
    describe('when postcode lookup is true', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: true
        }
      })

      test('it should return changeLink with account-address-select', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.changeLink).toEqual('/customer/1234567890/account-address-select')
      })
    })

    describe('when postcode lookup is false', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          postcodeLookup: false
        }
      })

      test('it should return changeLink with account-address-enter', () => {
        const result = personalAddressCheckPresenter(data)

        expect(result.changeLink).toEqual('/customer/1234567890/account-address-enter')
      })
    })
  })
})
