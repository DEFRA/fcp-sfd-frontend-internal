// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalFixListPresenter } from '../../../../src/presenters/personal/personal-fix-list-presenter.js'

describe('personalFixListPresenter', () => {
  const crn = '123456'
  let personalDetails
  let payload

  beforeEach(() => {
    personalDetails = {
      source: 'phone',
      orderedSectionsToFix: ['name', 'dob', 'address', 'phone', 'email'],
      info: {
        fullName: {
          first: 'Alfred',
          middle: 'J',
          last: 'Waldron'
        },
        dateOfBirth: {
          day: 1,
          month: 2,
          year: 1990
        }
      },
      contact: {
        telephone: '0123456789',
        mobile: '07123456789',
        email: 'test@test.com'
      }
    }

    payload = null
  })

  describe('when provided with personal fix list data', () => {
    test('it correctly presents the data', () => {
      const result = personalFixListPresenter(personalDetails, payload, crn)

      expect(result).toEqual({
        backLink: { href: `/customer/${crn}/details/fix?source=phone` },
        pageTitle: 'Your personal details to update',
        metaDescription: 'Your personal details to update.',
        sections: ['name', 'dob', 'address', 'phone', 'email'],
        name: {
          first: 'Alfred',
          middle: 'J',
          last: 'Waldron'
        },
        dateOfBirth: {
          day: '1',
          month: '2',
          year: '1990'
        },
        personalTelephone: '0123456789',
        personalMobile: '07123456789',
        personalEmail: 'test@test.com',
        address: null,
        errors: null
      })
    })
  })

  describe('the "name" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = {
          first: 'New',
          middle: 'Middle',
          last: 'Name'
        }
      })

      test('it should return the payload as the "name" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.name).toEqual({
          first: 'New',
          middle: 'Middle',
          last: 'Name'
        })
      })
    })

    describe('when provided with changed personal name data', () => {
      beforeEach(() => {
        personalDetails.changePersonalName = {
          first: 'Changed',
          middle: 'Person',
          last: 'Name'
        }
      })

      test('it should return the changed personal name as the "name" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.name).toEqual({
          first: 'Changed',
          middle: 'Person',
          last: 'Name'
        })
      })
    })
  })

  describe('the "dateOfBirth" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = {
          day: '10',
          month: '11',
          year: '2000'
        }
      })

      test('it should return the payload as the "dateOfBirth" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.dateOfBirth).toEqual({
          day: '10',
          month: '11',
          year: '2000'
        })
      })
    })

    describe('when provided with changed date of birth data', () => {
      beforeEach(() => {
        personalDetails.changePersonalDob = {
          day: '5',
          month: '6',
          year: '1985'
        }
      })

      test('it should return the changed date of birth as the "dateOfBirth" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.dateOfBirth).toEqual({
          day: '5',
          month: '6',
          year: '1985'
        })
      })
    })
  })

  describe('the "address" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = {
          address1: '1 Test Street',
          address2: 'Test Area',
          address3: '',
          city: 'Testville',
          county: 'Testshire',
          postcode: 'TE1 1ST',
          country: 'UK'
        }
      })

      test('it should return the payload as the "address" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.address).toEqual({
          address1: '1 Test Street',
          address2: 'Test Area',
          address3: '',
          city: 'Testville',
          county: 'Testshire',
          postcode: 'TE1 1ST',
          country: 'UK'
        })
      })
    })

    describe('when provided with changed personal address data', () => {
      beforeEach(() => {
        personalDetails.changePersonalAddress = {
          address1: '2 Changed Road',
          address2: 'Changed Area',
          address3: '',
          city: 'Changedville',
          county: 'Changedshire',
          postcode: 'CH2 2NG',
          country: 'UK'
        }
      })

      test('it should return the changed personal address as the "address" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.address).toEqual({
          address1: '2 Changed Road',
          address2: 'Changed Area',
          address3: '',
          city: 'Changedville',
          county: 'Changedshire',
          postcode: 'CH2 2NG',
          country: 'UK'
        })
      })
    })

    describe('when no payload and no changed address is provided', () => {
      beforeEach(() => {
        delete personalDetails.changePersonalAddress
        payload = null
      })

      test('it should return null as the "address" property', () => {
        const result = personalFixListPresenter(personalDetails, payload, crn)

        expect(result.address).toBeNull()
      })
    })
  })

  describe('the "errors" property', () => {
    let errors

    beforeEach(() => {
      errors = {
        first: { message: 'Enter your first name' },
        year: { message: 'Enter a valid year' },
        postcode: { message: 'Enter a postcode' },
        personalEmail: { message: 'Enter an email address' }
      }
    })

    test('it sorts errors by section and field order', () => {
      const result = personalFixListPresenter(personalDetails, payload, crn, errors)

      expect(result.errors).toEqual([
        { field: 'first', message: 'Enter your first name' },
        { field: 'year', message: 'Enter a valid year' },
        { field: 'postcode', message: 'Enter a postcode' },
        { field: 'personalEmail', message: 'Enter an email address' }
      ])
    })
  })
})
